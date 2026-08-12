import { ExpenseStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { roundMoney } from "@/lib/money";
import { startOfDay, toNumber } from "@/lib/utils";

export function computeExpenseStatus(
  amount: number,
  amountPaid: number,
  dueDate: Date,
  today = startOfDay(),
): ExpenseStatus {
  if (amountPaid <= 0) {
    return startOfDay(dueDate) < today ? ExpenseStatus.OVERDUE : ExpenseStatus.PENDING;
  }
  if (amountPaid + 0.001 < amount) return ExpenseStatus.PARTIALLY_PAID;
  return ExpenseStatus.PAID;
}

export async function refreshExpenseStatuses(tx: Prisma.TransactionClient = prisma) {
  const today = startOfDay();
  const open = await tx.expense.findMany({
    where: {
      status: {
        in: [ExpenseStatus.PENDING, ExpenseStatus.OVERDUE, ExpenseStatus.PARTIALLY_PAID],
      },
    },
  });

  for (const expense of open) {
    const next = computeExpenseStatus(
      toNumber(expense.amount),
      toNumber(expense.amountPaid),
      expense.dueDate,
      today,
    );
    if (next !== expense.status) {
      await tx.expense.update({ where: { id: expense.id }, data: { status: next } });
    }
  }
}

export async function registerExpensePayment(input: {
  expenseId: string;
  amount: number;
  paidAt: Date;
  paymentMethodId: string;
  notes?: string;
  userId?: string;
}) {
  const amount = roundMoney(input.amount);
  if (amount <= 0) throw new Error("Valor do pagamento deve ser positivo");

  return prisma.$transaction(async (tx) => {
    const expense = await tx.expense.findUniqueOrThrow({ where: { id: input.expenseId } });
    if (expense.status === ExpenseStatus.CANCELLED) {
      throw new Error("Despesa cancelada");
    }

    const currentPaid = toNumber(expense.amountPaid);
    const total = toNumber(expense.amount);
    const balance = roundMoney(Math.max(0, total - currentPaid));
    if (amount > balance + 0.001) {
      throw new Error("Valor excede o saldo da despesa");
    }

    const payment = await tx.expensePayment.create({
      data: {
        expenseId: expense.id,
        paymentMethodId: input.paymentMethodId,
        amount,
        paidAt: input.paidAt,
        notes: input.notes,
        createdById: input.userId,
      },
    });

    const newPaid = roundMoney(currentPaid + amount);
    const status = computeExpenseStatus(total, newPaid, expense.dueDate);

    await tx.expense.update({
      where: { id: expense.id },
      data: { amountPaid: newPaid, status },
    });

    await writeAuditLog({
      userId: input.userId,
      action: "REGISTER_EXPENSE_PAYMENT",
      entity: "ExpensePayment",
      entityId: payment.id,
      metadata: { expenseId: expense.id, amount },
    });

    return payment;
  });
}
