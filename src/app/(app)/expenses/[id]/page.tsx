import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { payExpenseAction } from "@/app/actions/expenses";
import { Badge, Button, Card, Field, Flash, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { expenseStatusLabel, statusTone } from "@/lib/labels";

export default async function ExpenseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      supplier: true,
      category: true,
      payments: {
        where: { voidedAt: null },
        include: { paymentMethod: true },
        orderBy: { paidAt: "desc" },
      },
    },
  });
  if (!expense) notFound();

  const methods = await prisma.paymentMethod.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  const amount = toNumber(expense.amount);
  const paid = toNumber(expense.amountPaid);
  const balance = Math.max(0, amount - paid);

  return (
    <div>
      <PageHeader title={expense.description} description={`${expense.category.name} · venc. ${formatDate(expense.dueDate)}`} />
      <Flash message={sp.ok} />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {[
          ["Valor", formatCurrency(amount)],
          ["Pago", formatCurrency(paid)],
          ["Saldo", formatCurrency(balance)],
          ["Status", expenseStatusLabel[expense.status]],
        ].map(([label, value]) => (
          <Card key={label} className="!p-4">
            <p className="text-xs uppercase text-[var(--muted)]">{label}</p>
            <p className="mt-1 text-[18px] font-semibold tracking-tight">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <p className="text-sm text-[var(--muted)]">Fornecedor</p>
          <p className="font-semibold">{expense.supplier?.name || "—"}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">Recorrência</p>
          <p className="font-semibold">{expense.recurrence}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">Status</p>
          <Badge tone={statusTone(expense.status)}>{expenseStatusLabel[expense.status]}</Badge>
          {expense.notes ? <p className="mt-4 text-sm">{expense.notes}</p> : null}
        </Card>

        <Card>
          <h2 className="mb-3 text-[18px] font-semibold tracking-tight">Registrar pagamento</h2>
          {balance <= 0 ? (
            <p className="text-sm text-[var(--muted)]">Despesa quitada.</p>
          ) : (
            <form action={payExpenseAction} className="space-y-3">
              <input type="hidden" name="expenseId" value={expense.id} />
              <Field label="Valor">
                <Input name="amount" type="number" step="0.01" min="0.01" max={balance} defaultValue={String(balance)} required />
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
                <Textarea name="notes" rows={2} />
              </Field>
              <Button type="submit">Registrar pagamento</Button>
            </form>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-[18px] font-semibold tracking-tight">Histórico de pagamentos</h2>
        {expense.payments.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhum pagamento registrado.</p>
        ) : (
          <ul className="space-y-2">
            {expense.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2 text-sm">
                <span>
                  {formatDate(p.paidAt)} · {p.paymentMethod.name}
                </span>
                <span className="font-semibold">{formatCurrency(toNumber(p.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
