import { PrismaClient, DueRule } from "@prisma/client";
import {
  createPaymentPlan,
  registerReceivablePayment,
  getTreatmentFinancialSummary,
  refreshInstallmentStatuses,
} from "../src/domain/receivables";
import { registerExpensePayment, refreshExpenseStatuses } from "../src/domain/payables";
import { getDashboardMetrics } from "../src/domain/dashboard";

const prisma = new PrismaClient();

async function main() {
  await refreshInstallmentStatuses();
  await refreshExpenseStatuses();

  const patient = await prisma.patient.create({
    data: { fullName: "Smoke Test Paciente", whatsapp: "85990001111" },
  });
  const dentist = await prisma.dentist.create({
    data: { fullName: "Smoke Test Dentista" },
  });
  const method = await prisma.paymentMethod.findFirstOrThrow();
  const category = await prisma.category.findFirstOrThrow();

  const treatment = await prisma.treatment.create({
    data: {
      patientId: patient.id,
      dentistId: dentist.id,
      description: "Tratamento smoke test",
      contractedAmount: 1000,
    },
  });

  const plan = await createPaymentPlan({
    treatmentId: treatment.id,
    downPaymentAmount: 200,
    installmentsCount: 4,
    firstDueDate: new Date(),
    dueDay: 5,
    intervalMonths: 1,
    dueRule: DueRule.INTERVAL_MONTHS,
  });

  const first = plan.installments[0];
  await registerReceivablePayment({
    installmentId: first.id,
    amount: Number(first.amount),
    paidAt: new Date(),
    paymentMethodId: method.id,
  });

  const summary = await getTreatmentFinancialSummary(treatment.id);
  console.log("treatment balance after 1 payment:", summary.balance);

  const expense = await prisma.expense.create({
    data: {
      categoryId: category.id,
      description: "Despesa smoke",
      amount: 150,
      dueDate: new Date(),
    },
  });

  await registerExpensePayment({
    expenseId: expense.id,
    amount: 150,
    paidAt: new Date(),
    paymentMethodId: method.id,
  });

  const dash = await getDashboardMetrics();
  console.log("dashboard totalReceivable:", dash.totalReceivable);
  console.log("dashboard overdueCount:", dash.overdueCount);
  console.log("SMOKE OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
