"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Recurrence } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { computeExpenseStatus, registerExpensePayment } from "@/domain/payables";
import { requireUser } from "@/app/actions/helpers";
import { formDate, formNumber, formString } from "@/lib/form";

export async function createExpenseAction(formData: FormData) {
  const user = await requireUser();
  const description = formString(formData, "description");
  const categoryId = formString(formData, "categoryId");
  const supplierId = formString(formData, "supplierId") || null;
  const amount = formNumber(formData, "amount");
  const dueDate = formDate(formData, "dueDate");
  const recurrence = (formString(formData, "recurrence") as Recurrence) || Recurrence.NONE;
  const notes = formString(formData, "notes") || null;

  if (!description || !categoryId) throw new Error("Descrição e categoria são obrigatórias");
  if (amount <= 0) throw new Error("Valor inválido");

  const expense = await prisma.expense.create({
    data: {
      description,
      categoryId,
      supplierId,
      amount,
      dueDate,
      recurrence,
      notes,
      status: computeExpenseStatus(amount, 0, dueDate),
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "Expense",
    entityId: expense.id,
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect(`/expenses/${expense.id}`);
}

export async function payExpenseAction(formData: FormData) {
  const user = await requireUser();
  const expenseId = formString(formData, "expenseId");
  const amount = formNumber(formData, "amount");
  const paidAt = formDate(formData, "paidAt");
  const paymentMethodId = formString(formData, "paymentMethodId");
  const notes = formString(formData, "notes") || undefined;

  await registerExpensePayment({
    expenseId,
    amount,
    paidAt,
    paymentMethodId,
    notes,
    userId: user.id,
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect(`/expenses/${expenseId}?ok=Pagamento registrado`);
}
