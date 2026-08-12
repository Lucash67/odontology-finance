import { loginAction } from "@/app/actions/auth";
import { Button, Card, Field, Flash, Input } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          odontology-finance
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight">
          Entrar no sistema
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Ambiente de desenvolvimento do consultório.
        </p>
      </div>
      <Card>
        <Flash message={params.error} tone="error" />
        <form action={loginAction} className="space-y-4">
          <Field label="E-mail">
            <Input name="email" type="email" required defaultValue="admin@clinic.dev" />
          </Field>
          <Field label="Senha">
            <Input name="password" type="password" required defaultValue="admin123" />
          </Field>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Seed: admin@clinic.dev / admin123
        </p>
      </Card>
    </div>
  );
}
