import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPatientAction } from "@/app/actions/catalog";
import { Badge, Button, Card, EmptyState, Field, Flash, Input, PageHeader, Textarea } from "@/components/ui";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ok?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();

  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { whatsapp: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { fullName: "asc" },
    include: { _count: { select: { treatments: true } } },
  });

  return (
    <div>
      <PageHeader title="Pacientes" description="Cadastro e busca de pacientes." />
      <Flash message={params.ok} />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <form className="mb-4">
            <Field label="Buscar">
              <Input name="q" placeholder="Nome ou telefone" defaultValue={q} />
            </Field>
            <Button type="submit" variant="secondary" className="mt-3">
              Filtrar
            </Button>
          </form>

          {patients.length === 0 ? (
            <EmptyState title="Nenhum paciente" description="Cadastre o primeiro paciente ao lado." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-[var(--muted)]">
                  <tr>
                    <th className="py-2">Nome</th>
                    <th className="py-2">WhatsApp</th>
                    <th className="py-2">Tratamentos</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--line)]">
                      <td className="py-2">
                        <Link className="font-semibold text-[var(--brand)] hover:underline" href={`/patients/${p.id}`}>
                          {p.fullName}
                        </Link>
                      </td>
                      <td className="py-2">{p.whatsapp || p.phone || "—"}</td>
                      <td className="py-2">{p._count.treatments}</td>
                      <td className="py-2">
                        <Badge tone={p.active ? "success" : "neutral"}>{p.active ? "Ativo" : "Inativo"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-[18px] font-semibold tracking-tight">Novo paciente</h2>
          <form action={createPatientAction} className="space-y-3">
            <Field label="Nome completo">
              <Input name="fullName" required />
            </Field>
            <Field label="CPF (opcional)">
              <Input name="document" />
            </Field>
            <Field label="Telefone">
              <Input name="phone" />
            </Field>
            <Field label="WhatsApp">
              <Input name="whatsapp" />
            </Field>
            <Field label="E-mail">
              <Input name="email" type="email" />
            </Field>
            <Field label="Observações">
              <Textarea name="notes" rows={3} />
            </Field>
            <Button type="submit">Salvar paciente</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
