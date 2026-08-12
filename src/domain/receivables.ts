import {
  DueRule,
  InstallmentStatus,
  PaymentPlanStatus,
  TreatmentStatus,
  type Prisma,
} from "@prisma/client";
import { addMonths, setDate } from "date-fns";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { splitInstallments, roundMoney } from "@/lib/money";
import { computeInstallmentStatus, installmentBalance } from "@/domain/installments";
import { startOfDay, toNumber } from "@/lib/utils";

function buildDueDates(
  firstDueDate: Date,
  count: number,
  dueDay: number,
  intervalMonths: number,
  dueRule: DueRule,
) {
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    let d = addMonths(firstDueDate, i * intervalMonths);
    if (dueRule === DueRule.FIXED_DAY || dueRule === DueRule.INTERVAL_MONTHS) {
      const clampedDay = Math.min(dueDay, 28);
      d = setDate(d, clampedDay);
    }
    dates.push(startOfDay(d));
  }
  return dates;
}

export async function refreshInstallmentStatuses(tx: Prisma.TransactionClient = prisma) {
  const today = startOfDay();
  const open = await tx.receivableInstallment.findMany({
    where: {
      status: {
        in: [
          InstallmentStatus.PENDING,
          InstallmentStatus.OVERDUE,
          InstallmentStatus.PARTIALLY_PAID,
        ],
      },
    },
  });

  for (const inst of open) {
    const amount = toNumber(inst.amount);
    const paid = toNumber(inst.amountPaid);
    const next = computeInstallmentStatus(amount, paid, inst.dueDate, today);
    if (next !== inst.status) {
      await tx.receivableInstallment.update({
        where: { id: inst.id },
        data: { status: next },
      });
    }
  }
}

export async function createPaymentPlan(input: {
  treatmentId: string;
  downPaymentAmount: number;
  installmentsCount: number;
  firstDueDate: Date;
  dueDay?: number;
  intervalMonths?: number;
  dueRule?: DueRule;
  userId?: string;
}) {
  const treatment = await prisma.treatment.findUniqueOrThrow({
    where: { id: input.treatmentId },
    include: { paymentPlan: true },
  });

  if (treatment.paymentPlan) {
    throw new Error("Este tratamento já possui plano financeiro");
  }

  const contracted = toNumber(treatment.contractedAmount);
  const down = roundMoney(input.downPaymentAmount);
  if (down < 0 || down > contracted) {
    throw new Error("Entrada inválida");
  }
  if (input.installmentsCount < 1) {
    throw new Error("Informe ao menos 1 parcela");
  }

  const toFinance = roundMoney(contracted - down);
  const amounts = splitInstallments(toFinance, input.installmentsCount);
  const installmentAmount = amounts[0];

  const settings = await prisma.setting.findFirst();
  const dueDay = input.dueDay ?? settings?.defaultDueDay ?? 5;
  const intervalMonths = input.intervalMonths ?? 1;
  const dueRule = input.dueRule ?? DueRule.INTERVAL_MONTHS;
  const dueDates = buildDueDates(
    input.firstDueDate,
    input.installmentsCount,
    dueDay,
    intervalMonths,
    dueRule,
  );

  const result = await prisma.$transaction(async (tx) => {
    const plan = await tx.paymentPlan.create({
      data: {
        treatmentId: treatment.id,
        downPaymentAmount: down,
        installmentsCount: input.installmentsCount,
        installmentAmount,
        firstDueDate: startOfDay(input.firstDueDate),
        dueDay,
        dueRule,
        intervalMonths,
        status: PaymentPlanStatus.ACTIVE,
        installments: {
          create: amounts.map((amount, idx) => ({
            treatmentId: treatment.id,
            patientId: treatment.patientId,
            sequenceNumber: idx + 1,
            dueDate: dueDates[idx],
            amount,
            amountPaid: 0,
            status: computeInstallmentStatus(amount, 0, dueDates[idx]),
          })),
        },
      },
      include: { installments: { orderBy: { sequenceNumber: "asc" } } },
    });

    await tx.treatment.update({
      where: { id: treatment.id },
      data: { status: TreatmentStatus.ACTIVE },
    });

    await writeAuditLog({
      userId: input.userId,
      action: "CREATE_PAYMENT_PLAN",
      entity: "PaymentPlan",
      entityId: plan.id,
      metadata: {
        treatmentId: treatment.id,
        installmentsCount: input.installmentsCount,
        downPaymentAmount: down,
      },
    });

    return plan;
  });

  return result;
}

export async function registerReceivablePayment(input: {
  installmentId: string;
  amount: number;
  paidAt: Date;
  paymentMethodId: string;
  notes?: string;
  userId?: string;
}) {
  const amount = roundMoney(input.amount);
  if (amount <= 0) throw new Error("Valor do pagamento deve ser positivo");

  return prisma.$transaction(async (tx) => {
    const installment = await tx.receivableInstallment.findUniqueOrThrow({
      where: { id: input.installmentId },
      include: { payments: { where: { voidedAt: null } } },
    });

    if (installment.status === InstallmentStatus.CANCELLED) {
      throw new Error("Parcela cancelada");
    }

    const currentPaid = toNumber(installment.amountPaid);
    const installmentAmount = toNumber(installment.amount);
    const balance = installmentBalance(installmentAmount, currentPaid);
    if (amount > balance + 0.001) {
      throw new Error("Valor excede o saldo da parcela");
    }

    const payment = await tx.receivablePayment.create({
      data: {
        installmentId: installment.id,
        treatmentId: installment.treatmentId,
        patientId: installment.patientId,
        paymentMethodId: input.paymentMethodId,
        amount,
        paidAt: input.paidAt,
        notes: input.notes,
        createdById: input.userId,
      },
    });

    const newPaid = roundMoney(currentPaid + amount);
    const status = computeInstallmentStatus(installmentAmount, newPaid, installment.dueDate);

    await tx.receivableInstallment.update({
      where: { id: installment.id },
      data: { amountPaid: newPaid, status },
    });

    const openCount = await tx.receivableInstallment.count({
      where: {
        treatmentId: installment.treatmentId,
        status: {
          notIn: [InstallmentStatus.PAID, InstallmentStatus.CANCELLED],
        },
      },
    });

    if (openCount === 0) {
      await tx.paymentPlan.updateMany({
        where: { treatmentId: installment.treatmentId },
        data: { status: PaymentPlanStatus.COMPLETED },
      });
    }

    await writeAuditLog({
      userId: input.userId,
      action: "REGISTER_RECEIVABLE_PAYMENT",
      entity: "ReceivablePayment",
      entityId: payment.id,
      metadata: { installmentId: installment.id, amount },
    });

    return payment;
  });
}

export async function getTreatmentFinancialSummary(treatmentId: string) {
  const treatment = await prisma.treatment.findUniqueOrThrow({
    where: { id: treatmentId },
    include: {
      paymentPlan: true,
      installments: { include: { payments: { where: { voidedAt: null } } } },
      patient: true,
      dentist: true,
    },
  });

  const contracted = toNumber(treatment.contractedAmount);
  const down = toNumber(treatment.paymentPlan?.downPaymentAmount ?? 0);
  const paidInstallments = treatment.installments.reduce(
    (acc, i) => acc + toNumber(i.amountPaid),
    0,
  );
  const totalPaid = roundMoney(down + paidInstallments);
  const balance = roundMoney(Math.max(0, contracted - totalPaid));

  return {
    treatment,
    contracted,
    downPayment: down,
    totalPaid,
    balance,
  };
}
