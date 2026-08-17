import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seed vazio de portfólio/demo.
 * Sem pacientes, tratamentos, valores ou qualquer dado que lembre operação real.
 * Só estrutura mínima para login e cadastros funcionarem.
 */
const prisma = new PrismaClient();

async function main() {
  await prisma.whatsAppMessage.deleteMany();
  await prisma.receivablePayment.deleteMany();
  await prisma.receivableInstallment.deleteMany();
  await prisma.paymentPlan.deleteMany();
  await prisma.treatment.deleteMany();
  await prisma.expensePayment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.dentist.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.whatsAppTemplate.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "demo@odontology.finance",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo Financeiro",
      email: "finance@odontology.finance",
      passwordHash,
      role: Role.FINANCIAL,
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo Recepção",
      email: "front@odontology.finance",
      passwordHash,
      role: Role.RECEPTIONIST,
    },
  });

  await prisma.setting.create({
    data: {
      clinicName: "Ambiente Demo (sem dados operacionais)",
      defaultDueDay: 10,
      reminderDaysBefore: 3,
      overdueChargeDays: 3,
      whatsappEnabled: false,
    },
  });

  // Catálogo genérico vazio de negócio — só para formulários; sem volumes financeiros.
  await Promise.all(
    ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Boleto", "Transferência"].map(
      (name) => prisma.paymentMethod.create({ data: { name } }),
    ),
  );

  await Promise.all(
    ["Aluguel", "Laboratório", "Materiais", "Software", "Limpeza", "Impostos", "Marketing"].map(
      (name) => prisma.category.create({ data: { name, kind: "EXPENSE" } }),
    ),
  );

  await prisma.whatsAppTemplate.createMany({
    data: [
      {
        key: "reminder_before",
        name: "Lembrete antes do vencimento",
        body: "Olá {{patient_name}}, lembramos que a parcela de {{amount}} do tratamento {{treatment}} vence em {{due_date}}.",
      },
      {
        key: "reminder_due_today",
        name: "Lembrete no dia",
        body: "Olá {{patient_name}}, sua parcela de {{amount}} vence hoje ({{due_date}}). Qualquer dúvida, fale conosco.",
      },
      {
        key: "charge_overdue",
        name: "Cobrança após vencimento",
        body: "Olá {{patient_name}}, identificamos a parcela de {{amount}} vencida em {{due_date}} referente a {{treatment}}. Podemos ajudar a regularizar?",
      },
    ],
  });

  console.log("Seed OK (demo vazia — sem dados operacionais)");
  console.log("Login: demo@odontology.finance / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
