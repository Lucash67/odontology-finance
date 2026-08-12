import { loginAction } from "@/app/actions/auth";
import { BrandLockup } from "@/components/brand";
import { Button, Card, Field, Flash, Input } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_15%_-10%,#e6f6ee_0%,transparent_55%),radial-gradient(700px_360px_at_90%_0%,#f1efe8_0%,transparent_50%)]" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <BrandLockup subtitle="finance" />
        <span className="rounded-[var(--radius-pill)] bg-[var(--beige)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--ink)]">
          Ambiente demo
        </span>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-5xl flex-col items-center justify-center px-6 pb-16">
        <div className="sw-animate-in mb-8 max-w-xl text-center">
          <span className="inline-flex rounded-[var(--radius-pill)] bg-[var(--brand-soft)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-ink)]">
            Consultório odontológico
          </span>
          <h1 className="mt-4 text-[40px] font-semibold tracking-tight text-[var(--ink)] sm:text-[48px]">
            Controle financeiro que escala com o consultório
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
            Pacientes, parcelas, inadimplência e contas a pagar em um fluxo limpo — no estilo do template.
          </p>
        </div>

        <Card className="sw-animate-in w-full max-w-md !p-6" hover>
          <Flash message={params.error} tone="error" />
          <form action={loginAction} className="space-y-4">
            <Field label="E-mail">
              <Input name="email" type="email" required defaultValue="admin@clinic.dev" />
            </Field>
            <Field label="Senha">
              <Input name="password" type="password" required defaultValue="admin123" />
            </Field>
            <Button type="submit" className="w-full">
              Entrar →
            </Button>
          </form>
          <p className="mt-4 text-center text-[12px] text-[var(--muted)]">
            Seed: admin@clinic.dev / admin123
          </p>
        </Card>
      </main>
    </div>
  );
}
