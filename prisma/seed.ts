import {
  DueRule,
  ExpenseStatus,
  InstallmentStatus,
  PrismaClient,
  Recurrence,
  Role,
  TreatmentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { addMonths, subDays, subMonths } from "date-fns";
import { splitInstallments, roundMoney } from "../src/lib/money";
import { computeInstallmentStatus } from "../src/domain/installments";
import { computeExpenseStatus } from "../src/domain/payables";

/**
 * Seed 100% fictício para demo/portfólio.
 * Nenhum dado de clínica real ou planilha de cliente.
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

  const admin = await prisma.user.create({
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
      passwordHash: await bcrypt.hash("demo1234", 10),
      role: Role.FINANCIAL,
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo Recepção",
      email: "front@odontology.finance",
      passwordHash: await bcrypt.hash("demo1234", 10),
      role: Role.RECEPTIONIST,
    },
  });

  await prisma.setting.create({
    data: {
      clinicName: "Aurora Dental Studio (Demo)",
      defaultDueDay: 5,
      reminderDaysBefore: 3,
      overdueChargeDays: 3,
      whatsappEnabled: false,
    },
  });

  const methods = await Promise.all(
    ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Boleto", "Transferência"].map(
      (name) => prisma.paymentMethod.create({ data: { name } }),
    ),
  );

  const categories = await Promise.all(
    ["Aluguel", "Laboratório", "Materiais", "Software", "Limpeza", "Impostos", "Marketing"].map(
      (name) => prisma.category.create({ data: { name, kind: "EXPENSE" } }),
    ),
  );

  const suppliers = await Promise.all(
    [
      { name: "Lab Smile Protese", phone: "11999990001" },
      { name: "Dental Market Brasil", phone: "11999990002" },
      { name: "Espaço Comercial Alpha", phone: "11999990003" },
      { name: "Higiene & Cia Serviços", phone: "11999990004" },
    ].map((s) => prisma.supplier.create({ data: s })),
  );

  const dentists = await Promise.all(
    ["Dra. Marina Oliveira", "Dr. Pedro Santos", "Dra. Laura Mendes"].map((fullName) =>
      prisma.dentist.create({ data: { fullName } }),
    ),
  );

  const patientsData = [
    { fullName: "Alex Rivera Costa", whatsapp: "11988880001", phone: "11988880001" },
    { fullName: "Bianca Torres Lima", whatsapp: "11988880002", phone: "11988880002" },
    { fullName: "Carlos Nogueira Silva", whatsapp: "11988880003", phone: "11988880003" },
    { fullName: "Diana Prado Souza", whatsapp: "11988880004", phone: "11988880004" },
    { fullName: "Eduardo Ramos Pinto", whatsapp: "11988880005", phone: "11988880005" },
    { fullName: "Fernanda Dias Rocha", whatsapp: "11988880006", phone: "11988880006" },
    { fullName: "Gustavo Melo Cardoso", whatsapp: "11988880007", phone: "11988880007" },
    { fullName: "Helena Barbosa Cruz", whatsapp: "11988880008", phone: "11988880008" },
  ];

  const patients = await Promise.all(patientsData.map((p) => prisma.patient.create({ data: p })));

  const treatmentsSeed = [
    { patient: 0, dentist: 0, description: "Reabilitação oral completa", amount: 12000, down: 2000, n: 10, firstOffset: -4, payFirst: 4 },
    { patient: 1, dentist: 0, description: "Implante unitário", amount: 6500, down: 1500, n: 8, firstOffset: -2, payFirst: 2 },
    { patient: 2, dentist: 1, description: "Aparelho ortodôntico", amount: 4800, down: 800, n: 12, firstOffset: -1, payFirst: 1 },
    { patient: 3, dentist: 0, description: "Prótese total", amount: 3500, down: 500, n: 6, firstOffset: -6, payFirst: 3 },
    { patient: 4, dentist: 2, description: "Clareamento + restaurações", amount: 2200, down: 0, n: 4, firstOffset: 0, payFirst: 0 },
    { patient: 5, dentist: 0, description: "Canal + coroa", amount: 2800, down: 800, n: 5, firstOffset: -3, payFirst: 5 },
    { patient: 6, dentist: 1, description: "Extração + enxerto", amount: 4100, down: 1000, n: 6, firstOffset: 1, payFirst: 0 },
    { patient: 7, dentist: 2, description: "Limpeza e prevenção anual", amount: 600, down: 0, n: 2, firstOffset: -1, payFirst: 1 },
  ];

  const pix = methods[0];

  for (const t of treatmentsSeed) {
    const patient = patients[t.patient];
    const dentist = dentists[t.dentist];
    const firstDue = addMonths(new Date(new Date().getFullYear(), new Date().getMonth(), 5), t.firstOffset);

    const treatment = await prisma.treatment.create({
      data: {
        patientId: patient.id,
        dentistId: dentist.id,
        description: t.description,
        contractedAmount: t.amount,
        status: TreatmentStatus.ACTIVE,
        budgetDate: subMonths(firstDue, 1),
        notes: "Dados fictícios de demonstração",
      },
    });

    const toFinance = roundMoney(t.amount - t.down);
    const amounts = splitInstallments(toFinance, t.n);

    const plan = await prisma.paymentPlan.create({
      data: {
        treatmentId: treatment.id,
        downPaymentAmount: t.down,
        installmentsCount: t.n,
        installmentAmount: amounts[0],
        firstDueDate: firstDue,
        dueDay: 5,
        dueRule: DueRule.INTERVAL_MONTHS,
        intervalMonths: 1,
      },
    });

    for (let i = 0; i < t.n; i++) {
      const dueDate = addMonths(firstDue, i);
      const amount = amounts[i];
      const shouldPay = i < t.payFirst;
      const amountPaid = shouldPay ? amount : 0;
      const status = computeInstallmentStatus(amount, amountPaid, dueDate) as InstallmentStatus;

      const installment = await prisma.receivableInstallment.create({
        data: {
          paymentPlanId: plan.id,
          treatmentId: treatment.id,
          patientId: patient.id,
          sequenceNumber: i + 1,
          dueDate,
          amount,
          amountPaid,
          status,
        },
      });

      if (shouldPay) {
        await prisma.receivablePayment.create({
          data: {
            installmentId: installment.id,
            treatmentId: treatment.id,
            patientId: patient.id,
            paymentMethodId: pix.id,
            amount: amountPaid,
            paidAt: dueDate,
            notes: "Pagamento demo",
            createdById: admin.id,
          },
        });
      }
    }
  }

  const expenseSeeds = [
    { supplier: 2, category: 0, description: "Aluguel do estúdio", amount: 4500, dueOffset: -5, paid: true, recurrence: Recurrence.MONTHLY },
    { supplier: 0, category: 1, description: "Prótese paciente demo", amount: 1200, dueOffset: 3, paid: false, recurrence: Recurrence.NONE },
    { supplier: 1, category: 2, description: "Resinas e descartáveis", amount: 890, dueOffset: -2, paid: true, recurrence: Recurrence.NONE },
    { supplier: 3, category: 4, description: "Limpeza mensal", amount: 650, dueOffset: 2, paid: false, recurrence: Recurrence.MONTHLY },
    { supplier: 1, category: 2, description: "Kit cirúrgico demo", amount: 1800, dueOffset: -10, paid: false, recurrence: Recurrence.NONE },
    { supplier: null, category: 3, description: "Assinatura software clínico", amount: 299, dueOffset: 8, paid: false, recurrence: Recurrence.MONTHLY },
  ];

  for (const e of expenseSeeds) {
    const dueDate = addMonths(new Date(), 0);
    const due = subDays(new Date(dueDate.getFullYear(), dueDate.getMonth(), 10), -e.dueOffset);
    const amountPaid = e.paid ? e.amount : 0;
    const status = computeExpenseStatus(e.amount, amountPaid, due);

    const expense = await prisma.expense.create({
      data: {
        supplierId: e.supplier == null ? null : suppliers[e.supplier].id,
        categoryId: categories[e.category].id,
        description: e.description,
        amount: e.amount,
        amountPaid,
        dueDate: due,
        status,
        recurrence: e.recurrence,
      },
    });

    if (e.paid) {
      await prisma.expensePayment.create({
        data: {
          expenseId: expense.id,
          paymentMethodId: methods[5].id,
          amount: e.amount,
          paidAt: due,
          createdById: admin.id,
        },
      });
    } else if (status === ExpenseStatus.OVERDUE) {
      // leave unpaid overdue for demo dashboard
    }
  }

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

  console.log("Seed OK (portfolio/demo)");
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
