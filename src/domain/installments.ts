import { InstallmentStatus, type Prisma } from "@prisma/client";
import { startOfDay } from "@/lib/utils";

export function computeInstallmentStatus(
  amount: number,
  amountPaid: number,
  dueDate: Date,
  today = startOfDay(),
): InstallmentStatus {
  if (amountPaid <= 0) {
    return startOfDay(dueDate) < today ? InstallmentStatus.OVERDUE : InstallmentStatus.PENDING;
  }
  if (amountPaid + 0.001 < amount) {
    return InstallmentStatus.PARTIALLY_PAID;
  }
  return InstallmentStatus.PAID;
}

export function installmentBalance(amount: number, amountPaid: number) {
  return Math.max(0, Math.round((amount - amountPaid) * 100) / 100);
}

export type InstallmentWithPayments = Prisma.ReceivableInstallmentGetPayload<{
  include: { payments: true };
}>;
