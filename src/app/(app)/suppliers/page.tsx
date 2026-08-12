import { prisma } from "@/lib/prisma";
import { createSupplierAction } from "@/app/actions/catalog";
import { Button, Card, EmptyState, Field, Flash, Input, PageHeader, Textarea } from "@/components/ui";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Fornecedores" description="Cadastro para contas a pagar." />
      <Flash message={params.ok} />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          {suppliers.length === 0 ? (
            <EmptyState title="Sem fornecedores" description="Cadastre laboratórios, imobiliária etc." />
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="py-2">Nome</th>
                  <th className="py-2">Telefone</th>
                  <th className="py-2">E-mail</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--line)]">
                    <td className="py-2 font-medium">{s.name}</td>
                    <td className="py-2">{s.phone || "—"}</td>
                    <td className="py-2">{s.email || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card>
          <form action={createSupplierAction} className="space-y-3">
            <Field label="Nome">
              <Input name="name" required />
            </Field>
            <Field label="Documento">
              <Input name="document" />
            </Field>
            <Field label="Telefone">
              <Input name="phone" />
            </Field>
            <Field label="E-mail">
              <Input name="email" />
            </Field>
            <Field label="Observações">
              <Textarea name="notes" rows={3} />
            </Field>
            <Button type="submit">Salvar fornecedor</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
