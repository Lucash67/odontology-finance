import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getDashboardMetrics } from "@/domain/dashboard";
import { Badge, Card, KpiCard, PageHeader } from "@/components/ui";
import { DashboardChart } from "@/components/dashboard-chart";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { installmentStatusLabel, statusTone } from "@/lib/labels";

export default async function DashboardPage() {
  const m = await getDashboardMetrics();

  const kpis = [
    {
      label: "Total a receber",
      value: formatCurrency(m.totalReceivable),
      tone: "brand" as const,
      icon: <Wallet size={16} />,
    },
    {
      label: "Recebido no mês",
      value: formatCurrency(m.receivedInPeriod),
      tone: "success" as const,
      icon: <TrendingUp size={16} />,
    },
    {
      label: "Previsto no mês",
      value: formatCurrency(m.expectedInPeriod),
      tone: "neutral" as const,
      icon: <CalendarClock size={16} />,
    },
    {
      label: "Vencido",
      value: formatCurrency(m.overdueAmount),
      tone: "danger" as const,
      icon: <AlertTriangle size={16} />,
    },
    {
      label: "Despesas do mês",
      value: formatCurrency(m.expensesInPeriod),
      tone: "warning" as const,
      icon: <TrendingDown size={16} />,
    },
    {
      label: "Despesas pagas",
      value: formatCurrency(m.expensesPaidInPeriod),
      tone: "neutral" as const,
      icon: <CircleDollarSign size={16} />,
    },
    {
      label: "Resultado (caixa)",
      value: formatCurrency(m.result),
      tone: m.result >= 0 ? ("success" as const) : ("danger" as const),
      icon: <ArrowUpRight size={16} />,
    },
    {
      label: "Parcelas vencidas",
      value: String(m.overdueCount),
      tone: "danger" as const,
      icon: <AlertTriangle size={16} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão do mês corrente com dados de demonstração do consultório."
      />

      <div className="sw-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} tone={kpi.tone} icon={kpi.icon} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card className="sw-animate-in" hover>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold tracking-tight">Recebido × despesas</h2>
            <span className="text-[12px] text-[var(--muted)]">últimos 6 meses</span>
          </div>
          <DashboardChart data={m.chart} />
        </Card>

        <Card className="sw-animate-in" hover>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold tracking-tight">Needs attention</h2>
            <Badge tone="danger" dot>
              {m.overduePatients} pacientes
            </Badge>
          </div>
          <div className="space-y-2">
            {m.overdueInstallments.length === 0 ? (
              <p className="text-[13px] text-[var(--muted)]">Nenhuma parcela vencida.</p>
            ) : (
              m.overdueInstallments.map((i) => (
                <Link
                  key={i.id}
                  href={`/treatments/${i.treatmentId}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-[var(--beige)]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone="danger" dot>
                        Vencida
                      </Badge>
                      <p className="truncate text-[13px] font-semibold">{i.patient.fullName}</p>
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--muted)]">
                      {i.treatment.description} · {formatDate(i.dueDate)}
                    </p>
                  </div>
                  <p className="ml-3 text-[13px] font-semibold text-[var(--danger)]">
                    {formatCurrency(toNumber(i.amount) - toNumber(i.amountPaid))}
                  </p>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="sw-animate-in mt-4" hover>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold tracking-tight">Próximos vencimentos</h2>
          <Link href="/receivables" className="text-[13px] font-semibold text-[var(--brand)] hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted-2)]">
              <tr>
                <th className="py-2 pr-3 font-medium">Paciente</th>
                <th className="py-2 pr-3 font-medium">Tratamento</th>
                <th className="py-2 pr-3 font-medium">Vencimento</th>
                <th className="py-2 pr-3 font-medium">Saldo</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {m.upcoming.map((i) => (
                <tr key={i.id} className="border-t border-[var(--line)]">
                  <td className="py-3 pr-3 font-medium">{i.patient.fullName}</td>
                  <td className="py-3 pr-3 text-[var(--muted)]">{i.treatment.description}</td>
                  <td className="py-3 pr-3">{formatDate(i.dueDate)}</td>
                  <td className="py-3 pr-3 font-semibold">
                    {formatCurrency(toNumber(i.amount) - toNumber(i.amountPaid))}
                  </td>
                  <td className="py-3">
                    <Badge tone={statusTone(i.status)} dot>
                      {installmentStatusLabel[i.status]}
                    </Badge>
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
