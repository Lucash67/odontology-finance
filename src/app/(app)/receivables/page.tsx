import Link from "next/link";
import { InstallmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { refreshInstallmentStatuses } from "@/domain/receivables";
import { payInstallmentAction } from "@/app/actions/treatments";
import { Badge, Button, Card, EmptyState, Field, Flash, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { installmentStatusLabel, statusTone } from "@/lib/labels";

export default async function ReceivablesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string }>;
}) {
  await refreshInstallmentStatuses();
  const params = await searchParams;
  const status = params.status as InstallmentStatus | undefined;

  const [installments, methods] = await Promise.all([
    prisma.receivableInstallment.findMany({
      where: status ? { status } : { status: { not: InstallmentStatus.CANCELLED } },
      include: { patient: true, treatment: true },
      orderBy: [{ dueDate: "asc" }, { sequenceNumber: "asc" }],
      take: 200,
    }),
    prisma.paymentMethod.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Recebíveis" description="Parcelas a receber, vencidas e pagas." />
      <Flash message={params.ok} />

      <Card className="mb-4">
        <form className="flex flex-wrap items-end gap-3">
          <Field label="Status">
            <Select name="status" defaultValue={status || ""}>
              <option value="">Todos (exceto canceladas)</option>
              <option value="PENDING">Pendente</option>
              <option value="OVERDUE">Vencida</option>
              <option value="PARTIALLY_PAID">Parcial</option>
              <option value="PAID">Paga</option>
            </Select>
          </Field>
          <Button type="submit" variant="secondary">
            Filtrar
          </Button>
        </form>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          {installments.length === 0 ? (
            <EmptyState title="Sem parcelas" description="Gere um plano financeiro em um tratamento." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-[var(--muted)]">
                  <tr>
                    <th className="py-2">Paciente</th>
                    <th className="py-2">Parcela</th>
                    <th className="py-2">Vencimento</th>
                    <th className="py-2">Saldo</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((i) => (
                    <tr key={i.id} className="border-t border-[var(--line)]">
                      <td className="py-2">
                        <Link href={`/treatments/${i.treatmentId}`} className="font-semibold text-[var(--brand)] hover:underline">
                          {i.patient.fullName}
                        </Link>
                        <p className="text-xs text-[var(--muted)]">{i.treatment.description}</p>
                      </td>
                      <td className="py-2">#{i.sequenceNumber}</td>
                      <td className="py-2">{formatDate(i.dueDate)}</td>
                      <td className="py-2">
                        {formatCurrency(Math.max(0, toNumber(i.amount) - toNumber(i.amountPaid)))}
                      </td>
                      <td className="py-2">
                        <Badge tone={statusTone(i.status)}>{installmentStatusLabel[i.status]}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-[18px] font-semibold tracking-tight">Baixa rápida</h2>
          <form action={payInstallmentAction} className="space-y-3">
            <input type="hidden" name="redirectTo" value="/receivables" />
            <Field label="Parcela em aberto">
              <Select name="installmentId" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {installments
                  .filter((i) => i.status !== "PAID")
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.patient.fullName} · #{i.sequenceNumber} ·{" "}
                      {formatCurrency(Math.max(0, toNumber(i.amount) - toNumber(i.amountPaid)))}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Valor">
              <Input name="amount" type="number" step="0.01" min="0.01" required />
            </Field>
            <Field label="Data">
              <Input name="paidAt" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Método">
              <Select name="paymentMethodId" required defaultValue={methods[0]?.id || ""}>
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Observação">
              <Textarea name="notes" rows={2} />
            </Field>
            <Button type="submit">Registrar pagamento</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
