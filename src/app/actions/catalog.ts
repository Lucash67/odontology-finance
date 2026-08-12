"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { requireUser } from "@/app/actions/helpers";
import { formString } from "@/lib/form";

export async function createPatientAction(formData: FormData) {
  const user = await requireUser();
  const fullName = formString(formData, "fullName");
  if (!fullName) throw new Error("Nome obrigatório");

  const patient = await prisma.patient.create({
    data: {
      fullName,
      document: formString(formData, "document") || null,
      phone: formString(formData, "phone") || null,
      whatsapp: formString(formData, "whatsapp") || null,
      email: formString(formData, "email") || null,
      notes: formString(formData, "notes") || null,
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "Patient",
    entityId: patient.id,
  });

  revalidatePath("/patients");
  redirect(`/patients/${patient.id}`);
}

export async function updatePatientAction(id: string, formData: FormData) {
  const user = await requireUser();
  await prisma.patient.update({
    where: { id },
    data: {
      fullName: formString(formData, "fullName"),
      document: formString(formData, "document") || null,
      phone: formString(formData, "phone") || null,
      whatsapp: formString(formData, "whatsapp") || null,
      email: formString(formData, "email") || null,
      notes: formString(formData, "notes") || null,
      active: formString(formData, "active") === "true",
    },
  });
  await writeAuditLog({ userId: user.id, action: "UPDATE", entity: "Patient", entityId: id });
  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  redirect(`/patients/${id}?ok=Paciente atualizado`);
}

export async function createDentistAction(formData: FormData) {
  const user = await requireUser();
  const fullName = formString(formData, "fullName");
  if (!fullName) throw new Error("Nome obrigatório");
  const dentist = await prisma.dentist.create({ data: { fullName } });
  await writeAuditLog({ userId: user.id, action: "CREATE", entity: "Dentist", entityId: dentist.id });
  revalidatePath("/dentists");
  redirect("/dentists?ok=Dentista cadastrado");
}

export async function createCategoryAction(formData: FormData) {
  const user = await requireUser();
  const name = formString(formData, "name");
  if (!name) throw new Error("Nome obrigatório");
  const category = await prisma.category.create({ data: { name } });
  await writeAuditLog({ userId: user.id, action: "CREATE", entity: "Category", entityId: category.id });
  revalidatePath("/categories");
  redirect("/categories?ok=Categoria criada");
}

export async function createSupplierAction(formData: FormData) {
  const user = await requireUser();
  const name = formString(formData, "name");
  if (!name) throw new Error("Nome obrigatório");
  const supplier = await prisma.supplier.create({
    data: {
      name,
      document: formString(formData, "document") || null,
      phone: formString(formData, "phone") || null,
      email: formString(formData, "email") || null,
      notes: formString(formData, "notes") || null,
    },
  });
  await writeAuditLog({ userId: user.id, action: "CREATE", entity: "Supplier", entityId: supplier.id });
  revalidatePath("/suppliers");
  redirect("/suppliers?ok=Fornecedor cadastrado");
}

export async function createPaymentMethodAction(formData: FormData) {
  const user = await requireUser();
  const name = formString(formData, "name");
  if (!name) throw new Error("Nome obrigatório");
  const method = await prisma.paymentMethod.create({ data: { name } });
  await writeAuditLog({ userId: user.id, action: "CREATE", entity: "PaymentMethod", entityId: method.id });
  revalidatePath("/payment-methods");
  redirect("/payment-methods?ok=Método criado");
}

export async function createUserAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Apenas administradores");

  const name = formString(formData, "name");
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const role = formString(formData, "role") as Role;

  if (!name || !email || !password) throw new Error("Preencha nome, e-mail e senha");

  const created = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: Object.values(Role).includes(role) ? role : Role.RECEPTIONIST,
    },
  });

  await writeAuditLog({ userId: user.id, action: "CREATE", entity: "User", entityId: created.id });
  revalidatePath("/users");
  redirect("/users?ok=Usuário criado");
}
