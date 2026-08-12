import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { refreshExpenseStatuses } from "@/domain/payables";
import { createExpenseAction } from "@/app/actions/expenses";
import { Badge, Button, Card, EmptyState, Field, Flash, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { expenseStatusLabel, statusTone } from "@/lib/labels";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await refreshExpenseStatuses();
  const params = await searchParams;

  const [expenses, suppliers, categories] = await Promise.all([
    prisma.expense.findMany({
      include: { supplier: true, category: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Contas a pagar" description="Despesas do consultório, separadas dos recebíveis." />
      <Flash message={params.ok} />

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          {expenses.length === 0 ? (
            <EmptyState title="Sem despesas" description="Cadastre aluguel, laboratório, materiais..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-[var(--muted)]">
                  <tr>
                    <th className="py-2">Descrição</th>
                    <th className="py-2">Categoria</th>
                    <th className="py-2">Vencimento</th>
                    <th className="py-2">Saldo</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-t border-[var(--line)]">
                      <td className="py-2">
                        <Link href={`/expenses/${e.id}`} className="font-semibold text-[var(--brand)] hover:underline">
                          {e.description}
                        </Link>
                        <p className="text-xs text-[var(--muted)]">{e.supplier?.name || "Sem fornecedor"}</p>
                      </td>
                      <td className="py-2">{e.category.name}</td>
                      <td className="py-2">{formatDate(e.dueDate)}</td>
                      <td className="py-2">
                        {formatCurrency(Math.max(0, toNumber(e.amount) - toNumber(e.amountPaid)))}
                      </td>
                      <td className="py-2">
                        <Badge tone={statusTone(e.status)}>{expenseStatusLabel[e.status]}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl">Nova despesa</h2>
          <form action={createExpenseAction} className="space-y-3">
            <Field label="Descrição">
              <Input name="description" required />
            </Field>
            <Field label="Categoria">
              <Select name="categoryId" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Fornecedor">
              <Select name="supplierId" defaultValue="">
                <option value="">—</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Valor">
              <Input name="amount" type="number" step="0.01" min="0.01" required />
            </Field>
            <Field label="Vencimento">
              <Input name="dueDate" type="date" required />
            </Field>
            <Field label="Recorrência">
              <Select name="recurrence" defaultValue="NONE">
                <option value="NONE">Nenhuma</option>
                <option value="MONTHLY">Mensal</option>
                <option value="YEARLY">Anual</option>
              </Select>
            </Field>
            <Field label="Observações">
              <Textarea name="notes" rows={2} />
            </Field>
            <Button type="submit">Salvar despesa</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
