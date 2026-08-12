import Link from "next/link";
import { getDashboardMetrics } from "@/domain/dashboard";
import { Badge, Card, PageHeader } from "@/components/ui";
import { DashboardChart } from "@/components/dashboard-chart";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { installmentStatusLabel, statusTone } from "@/lib/labels";

export default async function DashboardPage() {
  const m = await getDashboardMetrics();

  const kpis = [
    { label: "Total a receber", value: formatCurrency(m.totalReceivable) },
    { label: "Recebido no mês", value: formatCurrency(m.receivedInPeriod) },
    { label: "Previsto no mês", value: formatCurrency(m.expectedInPeriod) },
    { label: "Vencido", value: formatCurrency(m.overdueAmount) },
    { label: "Despesas do mês", value: formatCurrency(m.expensesInPeriod) },
    { label: "Despesas pagas", value: formatCurrency(m.expensesPaidInPeriod) },
    { label: "Resultado (caixa)", value: formatCurrency(m.result) },
    { label: "Parcelas vencidas", value: String(m.overdueCount) },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Indicadores reais do mês corrente (regime de caixa)."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="!p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {kpi.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl">
            Recebido × despesas (6 meses)
          </h2>
          <DashboardChart data={m.chart} />
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl">Parcelas vencidas</h2>
            <Badge tone="danger">{m.overduePatients} pacientes</Badge>
          </div>
          <div className="space-y-3">
            {m.overdueInstallments.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Nenhuma parcela vencida.</p>
            ) : (
              m.overdueInstallments.map((i) => (
                <Link
                  key={i.id}
                  href={`/treatments/${i.treatmentId}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2 hover:bg-black/[0.02]"
                >
                  <div>
                    <p className="text-sm font-semibold">{i.patient.fullName}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {i.treatment.description} · venc. {formatDate(i.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(toNumber(i.amount) - toNumber(i.amountPaid))}
                    </p>
                    <Badge tone={statusTone(i.status)}>{installmentStatusLabel[i.status]}</Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl">Próximos vencimentos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="py-2 pr-3">Paciente</th>
                <th className="py-2 pr-3">Tratamento</th>
                <th className="py-2 pr-3">Vencimento</th>
                <th className="py-2 pr-3">Saldo</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {m.upcoming.map((i) => (
                <tr key={i.id} className="border-t border-[var(--line)]">
                  <td className="py-2 pr-3 font-medium">{i.patient.fullName}</td>
                  <td className="py-2 pr-3">{i.treatment.description}</td>
                  <td className="py-2 pr-3">{formatDate(i.dueDate)}</td>
                  <td className="py-2 pr-3">
                    {formatCurrency(toNumber(i.amount) - toNumber(i.amountPaid))}
                  </td>
                  <td className="py-2">
                    <Badge tone={statusTone(i.status)}>{installmentStatusLabel[i.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
