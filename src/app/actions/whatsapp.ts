"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { simulateWhatsAppReminder } from "@/domain/whatsapp";
import { requireUser } from "@/app/actions/helpers";
import { formString } from "@/lib/form";

export async function simulateWhatsAppAction(formData: FormData) {
  const user = await requireUser();
  const installmentId = formString(formData, "installmentId");
  const templateKey = formString(formData, "templateKey");

  await simulateWhatsAppReminder({
    installmentId,
    templateKey,
    userId: user.id,
  });

  revalidatePath("/whatsapp");
  redirect("/whatsapp?ok=Mensagem simulada registrada");
}
