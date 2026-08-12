import { WhatsAppMessageStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toNumber } from "@/lib/utils";

function renderTemplate(
  body: string,
  vars: Record<string, string>,
) {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value),
    body,
  );
}

/** Internal simulation — no external provider. */
export async function simulateWhatsAppReminder(input: {
  installmentId: string;
  templateKey: string;
  userId?: string;
}) {
  const installment = await prisma.receivableInstallment.findUniqueOrThrow({
    where: { id: input.installmentId },
    include: { patient: true, treatment: true },
  });

  if (!installment.patient.whatsapp && !installment.patient.phone) {
    throw new Error("Paciente sem telefone/WhatsApp cadastrado");
  }

  const template = await prisma.whatsAppTemplate.findUnique({
    where: { key: input.templateKey },
  });
  if (!template || !template.active) {
    throw new Error("Template não encontrado");
  }

  const toPhone = installment.patient.whatsapp || installment.patient.phone || "";
  const body = renderTemplate(template.body, {
    patient_name: installment.patient.fullName,
    amount: formatCurrency(toNumber(installment.amount) - toNumber(installment.amountPaid)),
    due_date: formatDate(installment.dueDate),
    treatment: installment.treatment.description,
  });

  return prisma.whatsAppMessage.create({
    data: {
      patientId: installment.patientId,
      installmentId: installment.id,
      templateId: template.id,
      toPhone,
      body,
      status: WhatsAppMessageStatus.SIMULATED,
      sentAt: new Date(),
      createdById: input.userId,
    },
  });
}
