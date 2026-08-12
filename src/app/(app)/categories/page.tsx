import { prisma } from "@/lib/prisma";
import { createCategoryAction } from "@/app/actions/catalog";
import { Button, Card, EmptyState, Field, Flash, Input, PageHeader } from "@/components/ui";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Categorias" description="Categorias de despesas." />
      <Flash message={params.ok} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          {categories.length === 0 ? (
            <EmptyState title="Sem categorias" description="Crie a primeira categoria." />
          ) : (
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.id} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm font-medium">
                  {c.name}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <form action={createCategoryAction} className="space-y-3">
            <Field label="Nome">
              <Input name="name" required />
            </Field>
            <Button type="submit">Criar categoria</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
