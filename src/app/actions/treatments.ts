"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DueRule, TreatmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { createPaymentPlan, registerReceivablePayment } from "@/domain/receivables";
import { requireUser } from "@/app/actions/helpers";
import { formDate, formNumber, formString } from "@/lib/form";

export async function createTreatmentAction(formData: FormData) {
  const user = await requireUser();
  const patientId = formString(formData, "patientId");
  const dentistId = formString(formData, "dentistId");
  const description = formString(formData, "description");
  const contractedAmount = formNumber(formData, "contractedAmount");
  const notes = formString(formData, "notes") || null;
  const budgetDateRaw = formString(formData, "budgetDate");

  if (!patientId || !dentistId || !description) {
    throw new Error("Paciente, dentista e descrição são obrigatórios");
  }
  if (contractedAmount <= 0) throw new Error("Valor total inválido");

  const treatment = await prisma.treatment.create({
    data: {
      patientId,
      dentistId,
      description,
      contractedAmount,
      notes,
      budgetDate: budgetDateRaw ? new Date(budgetDateRaw) : new Date(),
      status: TreatmentStatus.DRAFT,
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "Treatment",
    entityId: treatment.id,
  });

  revalidatePath("/treatments");
  redirect(`/treatments/${treatment.id}`);
}

export async function createPlanAction(treatmentId: string, formData: FormData) {
  const user = await requireUser();
  const downPaymentAmount = formNumber(formData, "downPaymentAmount");
  const installmentsCount = formNumber(formData, "installmentsCount");
  const firstDueDate = formDate(formData, "firstDueDate");
  const dueDay = formNumber(formData, "dueDay");
  const intervalMonths = formNumber(formData, "intervalMonths");
  const dueRule = (formString(formData, "dueRule") as DueRule) || DueRule.INTERVAL_MONTHS;

  await createPaymentPlan({
    treatmentId,
    downPaymentAmount,
    installmentsCount: Math.trunc(installmentsCount),
    firstDueDate,
    dueDay: Math.trunc(dueDay),
    intervalMonths: Math.trunc(intervalMonths),
    dueRule,
    userId: user.id,
  });

  revalidatePath(`/treatments/${treatmentId}`);
  revalidatePath("/receivables");
  revalidatePath("/dashboard");
  redirect(`/treatments/${treatmentId}?ok=Plano gerado com parcelas`);
}

export async function payInstallmentAction(formData: FormData) {
  const user = await requireUser();
  const installmentId = formString(formData, "installmentId");
  const amount = formNumber(formData, "amount");
  const paidAt = formDate(formData, "paidAt");
  const paymentMethodId = formString(formData, "paymentMethodId");
  const notes = formString(formData, "notes") || undefined;
  const redirectTo = formString(formData, "redirectTo") || "/receivables";

  await registerReceivablePayment({
    installmentId,
    amount,
    paidAt,
    paymentMethodId,
    notes,
    userId: user.id,
  });

  revalidatePath("/receivables");
  revalidatePath("/dashboard");
  revalidatePath("/treatments");
  redirect(`${redirectTo}?ok=Pagamento registrado`);
}
