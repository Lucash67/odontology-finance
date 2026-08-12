import { ExpenseStatus, InstallmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { refreshInstallmentStatuses } from "@/domain/receivables";
import { refreshExpenseStatuses } from "@/domain/payables";
import { endOfMonth, startOfMonth, toNumber } from "@/lib/utils";
import { roundMoney } from "@/lib/money";

export async function getDashboardMetrics(reference = new Date()) {
  await refreshInstallmentStatuses();
  await refreshExpenseStatuses();

  const periodStart = startOfMonth(reference);
  const periodEnd = endOfMonth(reference);

  const [
    openInstallments,
    receivedPayments,
    expensePayments,
    expenses,
    upcoming,
    overdueInstallments,
  ] = await Promise.all([
    prisma.receivableInstallment.findMany({
      where: {
        status: {
          in: [
            InstallmentStatus.PENDING,
            InstallmentStatus.OVERDUE,
            InstallmentStatus.PARTIALLY_PAID,
          ],
        },
      },
    }),
    prisma.receivablePayment.findMany({
      where: {
        voidedAt: null,
        paidAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.expensePayment.findMany({
      where: {
        voidedAt: null,
        paidAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.expense.findMany({
      where: {
        status: { not: ExpenseStatus.CANCELLED },
        dueDate: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.receivableInstallment.findMany({
      where: {
        status: {
          in: [
            InstallmentStatus.PENDING,
            InstallmentStatus.OVERDUE,
            InstallmentStatus.PARTIALLY_PAID,
          ],
        },
        dueDate: { gte: new Date(), lte: periodEnd },
      },
      include: { patient: true, treatment: true },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    prisma.receivableInstallment.findMany({
      where: { status: InstallmentStatus.OVERDUE },
      include: { patient: true, treatment: true },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
  ]);

  const totalReceivable = roundMoney(
    openInstallments.reduce(
      (acc, i) => acc + Math.max(0, toNumber(i.amount) - toNumber(i.amountPaid)),
      0,
    ),
  );

  const overdueAmount = roundMoney(
    openInstallments
      .filter((i) => i.status === InstallmentStatus.OVERDUE || i.status === InstallmentStatus.PARTIALLY_PAID)
      .filter((i) => i.dueDate < new Date() || i.status === InstallmentStatus.OVERDUE)
      .reduce(
        (acc, i) => acc + Math.max(0, toNumber(i.amount) - toNumber(i.amountPaid)),
        0,
      ),
  );

  const expectedInPeriod = roundMoney(
    openInstallments
      .filter((i) => i.dueDate >= periodStart && i.dueDate <= periodEnd)
      .reduce(
        (acc, i) => acc + Math.max(0, toNumber(i.amount) - toNumber(i.amountPaid)),
        0,
      ),
  );

  const receivedInPeriod = roundMoney(
    receivedPayments.reduce((acc, p) => acc + toNumber(p.amount), 0),
  );

  const expensesInPeriod = roundMoney(
    expenses.reduce((acc, e) => acc + toNumber(e.amount), 0),
  );

  const expensesPaidInPeriod = roundMoney(
    expensePayments.reduce((acc, p) => acc + toNumber(p.amount), 0),
  );

  const result = roundMoney(receivedInPeriod - expensesPaidInPeriod);

  const overdueCount = await prisma.receivableInstallment.count({
    where: { status: InstallmentStatus.OVERDUE },
  });

  const overduePatientGroups = await prisma.receivableInstallment.groupBy({
    by: ["patientId"],
    where: { status: InstallmentStatus.OVERDUE },
  });

  // Simple monthly series for chart (last 6 months received vs expenses paid)
  const chart = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    const from = startOfMonth(d);
    const to = endOfMonth(d);
    const [rec, exp] = await Promise.all([
      prisma.receivablePayment.aggregate({
        where: { voidedAt: null, paidAt: { gte: from, lte: to } },
        _sum: { amount: true },
      }),
      prisma.expensePayment.aggregate({
        where: { voidedAt: null, paidAt: { gte: from, lte: to } },
        _sum: { amount: true },
      }),
    ]);
    chart.push({
      month: from.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      recebido: toNumber(rec._sum.amount),
      despesas: toNumber(exp._sum.amount),
    });
  }

  return {
    totalReceivable,
    receivedInPeriod,
    expectedInPeriod,
    overdueAmount,
    expensesInPeriod,
    expensesPaidInPeriod,
    result,
    overdueCount,
    overduePatients: overduePatientGroups.length,
    upcoming,
    overdueInstallments,
    chart,
    periodStart,
    periodEnd,
  };
}
