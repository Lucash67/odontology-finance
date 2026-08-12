import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createPlanAction, payInstallmentAction } from "@/app/actions/treatments";
import { getTreatmentFinancialSummary } from "@/domain/receivables";
import { Badge, Button, Card, Field, Flash, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { installmentStatusLabel, statusTone, treatmentStatusLabel } from "@/lib/labels";

export default async function TreatmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const summary = await getTreatmentFinancialSummary(id).catch(() => null);
  if (!summary) notFound();

  const { treatment, contracted, downPayment, totalPaid, balance } = summary;
  const methods = await prisma.paymentMethod.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  const settings = await prisma.setting.findFirst();
  const createPlan = createPlanAction.bind(null, treatment.id);

  return (
    <div>
      <PageHeader
        title={treatment.description}
        description={`${treatment.patient.fullName} · ${treatment.dentist.fullName}`}
      />
      <Flash message={sp.ok} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Valor contratado", formatCurrency(contracted)],
          ["Entrada", formatCurrency(downPayment)],
          ["Total pago", formatCurrency(totalPaid)],
          ["Saldo", formatCurrency(balance)],
          ["Status", treatmentStatusLabel[treatment.status]],
        ].map(([label, value]) => (
          <Card key={label} className="!p-4">
            <p className="text-xs uppercase text-[var(--muted)]">{label}</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-xl">{value}</p>
          </Card>
        ))}
      </div>

      {!treatment.paymentPlan ? (
        <Card className="mb-4 max-w-3xl">
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl">Criar plano financeiro</h2>
          <form action={createPlan} className="grid gap-3 sm:grid-cols-2">
            <Field label="Entrada">
              <Input name="downPaymentAmount" type="number" step="0.01" min="0" defaultValue="0" required />
            </Field>
            <Field label="Nº de parcelas">
              <Input name="installmentsCount" type="number" min="1" defaultValue="10" required />
            </Field>
            <Field label="Primeiro vencimento">
              <Input name="firstDueDate" type="date" required />
            </Field>
            <Field label="Dia de vencimento">
              <Input
                name="dueDay"
                type="number"
                min="1"
                max="28"
                defaultValue={String(settings?.defaultDueDay ?? 5)}
                required
              />
            </Field>
            <Field label="Intervalo (meses)">
              <Input name="intervalMonths" type="number" min="1" defaultValue="1" required />
            </Field>
            <Field label="Regra de vencimento">
              <Select name="dueRule" defaultValue="INTERVAL_MONTHS">
                <option value="INTERVAL_MONTHS">Intervalo mensal</option>
                <option value="FIXED_DAY">Dia fixo do mês</option>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit">Gerar parcelas</Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl">Parcelas</h2>
        {treatment.installments.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhuma parcela gerada ainda.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-[var(--muted)]">
                  <tr>
                    <th className="py-2">#</th>
                    <th className="py-2">Vencimento</th>
                    <th className="py-2">Valor</th>
                    <th className="py-2">Pago</th>
                    <th className="py-2">Saldo</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {treatment.installments
                    .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                    .map((i) => {
                      const amount = toNumber(i.amount);
                      const paid = toNumber(i.amountPaid);
                      return (
                        <tr key={i.id} className="border-t border-[var(--line)]">
                          <td className="py-2">{i.sequenceNumber}</td>
                          <td className="py-2">{formatDate(i.dueDate)}</td>
                          <td className="py-2">{formatCurrency(amount)}</td>
                          <td className="py-2">{formatCurrency(paid)}</td>
                          <td className="py-2">{formatCurrency(Math.max(0, amount - paid))}</td>
                          <td className="py-2">
                            <Badge tone={statusTone(i.status)}>{installmentStatusLabel[i.status]}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)]/60 p-4">
              <h3 className="mb-3 font-semibold">Registrar pagamento</h3>
              <form action={payInstallmentAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input type="hidden" name="redirectTo" value={`/treatments/${treatment.id}`} />
                <Field label="Parcela">
                  <Select name="installmentId" required defaultValue="">
                    <option value="" disabled>
                      Selecione
                    </option>
                    {treatment.installments
                      .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          #{i.sequenceNumber} · saldo{" "}
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
                  <Textarea name="notes" rows={1} />
                </Field>
                <div className="flex items-end">
                  <Button type="submit">Registrar pagamento</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
