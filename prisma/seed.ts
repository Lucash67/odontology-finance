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
      clinicName: "NovaLume Odontologia (Demo)",
      defaultDueDay: 12,
      reminderDaysBefore: 4,
      overdueChargeDays: 5,
      whatsappEnabled: false,
    },
  });

  const methods = await Promise.all(
    ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Boleto", "Transferência"].map(
      (name) => prisma.paymentMethod.create({ data: { name } }),
    ),
  );

  const categories = await Promise.all(
    ["Aluguel", "Laboratório", "Materiais", "Software", "Limpeza", "Impostos", "Marketing", "Energia"].map(
      (name) => prisma.category.create({ data: { name, kind: "EXPENSE" } }),
    ),
  );

  const suppliers = await Promise.all(
    [
      { name: "Cerâmica Digital Norte", phone: "21977770001" },
      { name: "Insumos Verde Mar", phone: "21977770002" },
      { name: "Cowork Odontológico Sul", phone: "21977770003" },
      { name: "CleanDay Facility", phone: "21977770004" },
      { name: "FluxAds Marketing", phone: "21977770005" },
    ].map((s) => prisma.supplier.create({ data: s })),
  );

  const dentists = await Promise.all(
    ["Dra. Sofia Albuquerque", "Dr. Renato Vale", "Dra. Camila Freitas", "Dr. Ícaro Brandt"].map(
      (fullName) => prisma.dentist.create({ data: { fullName } }),
    ),
  );

  // Nomes e valores inventados — escala/mix deliberadamente diferentes de qualquer carteira real.
  const patientsData = [
    { fullName: "Iris Quental", whatsapp: "21966660001", phone: "21966660001" },
    { fullName: "Noah Belmonte", whatsapp: "21966660002", phone: "21966660002" },
    { fullName: "Lara Vianna", whatsapp: "21966660003", phone: "21966660003" },
    { fullName: "Theo Galvão", whatsapp: "21966660004", phone: "21966660004" },
    { fullName: "Maya Ortega", whatsapp: "21966660005", phone: "21966660005" },
    { fullName: "Otto Brandão", whatsapp: "21966660006", phone: "21966660006" },
    { fullName: "Nina Severino", whatsapp: "21966660007", phone: "21966660007" },
    { fullName: "Léo Farage", whatsapp: "21966660008", phone: "21966660008" },
    { fullName: "Yuki Nakamura", whatsapp: "21966660009", phone: "21966660009" },
    { fullName: "Ayla Montenegro", whatsapp: "21966660010", phone: "21966660010" },
  ];

  const patients = await Promise.all(patientsData.map((p) => prisma.patient.create({ data: p })));

  const treatmentsSeed = [
    { patient: 0, dentist: 0, description: "Alinhadores estéticos (18 meses)", amount: 9800, down: 2800, n: 14, firstOffset: -5, payFirst: 5 },
    { patient: 1, dentist: 1, description: "Facetas em resina (6 elementos)", amount: 7200, down: 1200, n: 10, firstOffset: -3, payFirst: 3 },
    { patient: 2, dentist: 2, description: "Protocolo sobre 4 implantes", amount: 18500, down: 4500, n: 18, firstOffset: -2, payFirst: 2 },
    { patient: 3, dentist: 0, description: "Ortodontia interceptativa", amount: 5400, down: 900, n: 9, firstOffset: -7, payFirst: 6 },
    { patient: 4, dentist: 3, description: "Cirurgia de terceiros molares", amount: 3100, down: 600, n: 4, firstOffset: 0, payFirst: 0 },
    { patient: 5, dentist: 1, description: "Endodontia + pinos + coroa CAD/CAM", amount: 4650, down: 1150, n: 7, firstOffset: -4, payFirst: 4 },
    { patient: 6, dentist: 2, description: "Enxerto ósseo + membrana", amount: 8900, down: 2000, n: 12, firstOffset: 1, payFirst: 0 },
    { patient: 7, dentist: 3, description: "Manutenção periodontal trimestral", amount: 960, down: 0, n: 3, firstOffset: -1, payFirst: 1 },
    { patient: 8, dentist: 0, description: "Clareamento a laser + moldeira", amount: 1850, down: 450, n: 3, firstOffset: -1, payFirst: 2 },
    { patient: 9, dentist: 1, description: "Prótese parcial flexível", amount: 2750, down: 750, n: 5, firstOffset: -6, payFirst: 5 },
  ];

  const pix = methods[0];

  for (const t of treatmentsSeed) {
    const patient = patients[t.patient];
    const dentist = dentists[t.dentist];
    const firstDue = addMonths(new Date(new Date().getFullYear(), new Date().getMonth(), 12), t.firstOffset);

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
        dueDay: 12,
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
    { supplier: 2, category: 0, description: "Cowork + sala clínica", amount: 6800, dueOffset: -4, paid: true, recurrence: Recurrence.MONTHLY },
    { supplier: 0, category: 1, description: "Protocolo cerâmico paciente demo", amount: 2400, dueOffset: 5, paid: false, recurrence: Recurrence.NONE },
    { supplier: 1, category: 2, description: "Kit biomateriais e adesivos", amount: 1340, dueOffset: -1, paid: true, recurrence: Recurrence.NONE },
    { supplier: 3, category: 4, description: "Higienização semanal", amount: 980, dueOffset: 3, paid: false, recurrence: Recurrence.MONTHLY },
    { supplier: 1, category: 2, description: "Estoque de descartáveis Q3", amount: 2150, dueOffset: -12, paid: false, recurrence: Recurrence.NONE },
    { supplier: null, category: 3, description: "Plataforma de prontuário + agenda", amount: 449, dueOffset: 9, paid: false, recurrence: Recurrence.MONTHLY },
    { supplier: 4, category: 6, description: "Campanha Google Ads local", amount: 750, dueOffset: -3, paid: true, recurrence: Recurrence.NONE },
    { supplier: null, category: 7, description: "Conta de energia clínica", amount: 620, dueOffset: 6, paid: false, recurrence: Recurrence.MONTHLY },
  ];

  for (const e of expenseSeeds) {
    const dueDate = addMonths(new Date(), 0);
    const due = subDays(new Date(dueDate.getFullYear(), dueDate.getMonth(), 15), -e.dueOffset);
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
