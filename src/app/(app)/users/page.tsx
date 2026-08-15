import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createUserAction } from "@/app/actions/catalog";
import { Badge, Button, Card, Field, Flash, Input, PageHeader, Select } from "@/components/ui";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Usuários" description="Controle de acesso por roles." />
      <Flash message={params.ok} />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="py-2">Nome</th>
                  <th className="py-2">E-mail</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-[var(--line)]">
                    <td className="py-2 font-medium">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <Badge tone="brand">{u.role}</Badge>
                    </td>
                    <td className="py-2">
                      <Badge tone={u.active ? "success" : "neutral"}>{u.active ? "Ativo" : "Inativo"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          {session?.user.role === "ADMIN" ? (
            <form action={createUserAction} className="space-y-3">
              <Field label="Nome">
                <Input name="name" required />
              </Field>
              <Field label="E-mail">
                <Input name="email" type="email" required />
              </Field>
              <Field label="Senha">
                <Input name="password" type="password" required />
              </Field>
              <Field label="Role">
                <Select name="role" defaultValue="RECEPTIONIST">
                  <option value="ADMIN">ADMIN</option>
                  <option value="FINANCIAL">FINANCIAL</option>
                  <option value="RECEPTIONIST">RECEPTIONIST</option>
                </Select>
              </Field>
              <Button type="submit">Criar usuário</Button>
            </form>
          ) : (
            <p className="text-sm text-[var(--muted)]">Apenas administradores podem criar usuários.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
