import { prisma } from "@/lib/prisma";
import { createPaymentMethodAction } from "@/app/actions/catalog";
import { Button, Card, EmptyState, Field, Flash, Input, PageHeader } from "@/components/ui";

export default async function PaymentMethodsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const methods = await prisma.paymentMethod.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Métodos de pagamento" description="Pix, dinheiro, cartão, boleto..." />
      <Flash message={params.ok} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          {methods.length === 0 ? (
            <EmptyState title="Sem métodos" description="Cadastre ao menos um método." />
          ) : (
            <ul className="space-y-2">
              {methods.map((m) => (
                <li key={m.id} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium">
                  {m.name}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <form action={createPaymentMethodAction} className="space-y-3">
            <Field label="Nome">
              <Input name="name" required />
            </Field>
            <Button type="submit">Criar método</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
