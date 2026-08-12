import { InstallmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { simulateWhatsAppAction } from "@/app/actions/whatsapp";
import { Badge, Button, Card, EmptyState, Field, Flash, PageHeader, Select } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function WhatsAppPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;

  const [templates, messages, openInstallments] = await Promise.all([
    prisma.whatsAppTemplate.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.whatsAppMessage.findMany({
      include: { patient: true, template: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.receivableInstallment.findMany({
      where: {
        status: { in: [InstallmentStatus.PENDING, InstallmentStatus.OVERDUE, InstallmentStatus.PARTIALLY_PAID] },
      },
      include: { patient: true },
      orderBy: { dueDate: "asc" },
      take: 100,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="WhatsApp"
        description="Estrutura pronta + simulação interna. Sem integração externa nesta V1."
      />
      <Flash message={params.ok} />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-[18px] font-semibold tracking-tight">Simular envio</h2>
          <form action={simulateWhatsAppAction} className="space-y-3">
            <Field label="Parcela">
              <Select name="installmentId" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {openInstallments.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.patient.fullName} · #{i.sequenceNumber} · {formatDate(i.dueDate)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Template">
              <Select name="templateKey" required defaultValue="reminder_before">
                {templates.map((t) => (
                  <option key={t.id} value={t.key}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit">Simular mensagem</Button>
          </form>

          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Templates</h3>
            {templates.map((t) => (
              <div key={t.id} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm">
                <p className="font-semibold">{t.name}</p>
                <p className="text-[var(--muted)]">{t.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-[18px] font-semibold tracking-tight">Histórico</h2>
          {messages.length === 0 ? (
            <EmptyState title="Sem mensagens" description="Simule um lembrete ou cobrança." />
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="rounded-xl border border-[var(--line)] px-3 py-3 text-sm">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-semibold">{m.patient?.fullName || m.toPhone}</p>
                    <Badge tone="brand">{m.status}</Badge>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    {m.template?.name || "Sem template"} · {formatDate(m.createdAt)}
                  </p>
                  <p className="mt-2">{m.body}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
