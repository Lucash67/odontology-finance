import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { formatCurrency, toNumber } from "@/lib/utils";
import { statusTone, treatmentStatusLabel } from "@/lib/labels";

export default async function TreatmentsPage() {
  const treatments = await prisma.treatment.findMany({
    include: { patient: true, dentist: true, paymentPlan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Tratamentos"
        description="Orçamentos e contratos financeiros."
        actions={
          <Link href="/treatments/new">
            <Button type="button">Novo tratamento</Button>
          </Link>
        }
      />
      <Card>
        {treatments.length === 0 ? (
          <EmptyState title="Sem tratamentos" description="Crie o primeiro tratamento para gerar parcelas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="py-2">Paciente</th>
                  <th className="py-2">Descrição</th>
                  <th className="py-2">Dentista</th>
                  <th className="py-2">Valor</th>
                  <th className="py-2">Plano</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((t) => (
                  <tr key={t.id} className="border-t border-[var(--line)]">
                    <td className="py-2">
                      <Link href={`/treatments/${t.id}`} className="font-semibold text-[var(--brand)] hover:underline">
                        {t.patient.fullName}
                      </Link>
                    </td>
                    <td className="py-2">{t.description}</td>
                    <td className="py-2">{t.dentist.fullName}</td>
                    <td className="py-2">{formatCurrency(toNumber(t.contractedAmount))}</td>
                    <td className="py-2">{t.paymentPlan ? `${t.paymentPlan.installmentsCount}x` : "—"}</td>
                    <td className="py-2">
                      <Badge tone={statusTone(t.status)}>{treatmentStatusLabel[t.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
