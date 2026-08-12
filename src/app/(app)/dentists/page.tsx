import { prisma } from "@/lib/prisma";
import { createDentistAction } from "@/app/actions/catalog";
import { Badge, Button, Card, EmptyState, Field, Flash, Input, PageHeader } from "@/components/ui";

export default async function DentistsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const dentists = await prisma.dentist.findMany({
    orderBy: { fullName: "asc" },
    include: { _count: { select: { treatments: true } } },
  });

  return (
    <div>
      <PageHeader title="Dentistas" description="Profissionais vinculados aos tratamentos." />
      <Flash message={params.ok} />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          {dentists.length === 0 ? (
            <EmptyState title="Sem dentistas" description="Cadastre o primeiro profissional." />
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Tratamentos</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {dentists.map((d) => (
                  <tr key={d.id} className="border-t border-[var(--line)]">
                    <td className="py-2 font-medium">{d.fullName}</td>
                    <td className="py-2">{d._count.treatments}</td>
                    <td className="py-2">
                      <Badge tone={d.active ? "success" : "neutral"}>{d.active ? "Ativo" : "Inativo"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 text-[18px] font-semibold tracking-tight">Novo dentista</h2>
          <form action={createDentistAction} className="space-y-3">
            <Field label="Nome">
              <Input name="fullName" required />
            </Field>
            <Button type="submit">Salvar</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
