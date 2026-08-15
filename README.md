# odontology-finance

Sistema financeiro web para consultório odontológico — **versão demo de portfólio**.

> Todos os dados do seed são **100% fictícios**. Não há informações de clientes reais.

## Demo

| Campo | Valor |
|-------|-------|
| Login | `demo@odontology.finance` |
| Senha | `demo1234` |

Também: `finance@odontology.finance` / `front@odontology.finance` (mesma senha).

## Stack

- Next.js 15 (App Router) + TypeScript
- Prisma 6 + PostgreSQL
- NextAuth (credentials) + roles
- Tailwind CSS 4
- Zod / date-fns / Recharts

## Funcionalidades

- Cadastros (pacientes, dentistas, fornecedores, categorias, métodos)
- Recebíveis com plano financeiro, parcelas e pagamentos
- Contas a pagar
- Dashboard com KPIs reais do banco
- Simulação de lembretes WhatsApp (sem provedor externo)
- Auditoria básica

## Setup local

```bash
docker compose up -d
npm install
npm run db:setup
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

PostgreSQL local: `localhost:5433` (ver `docker-compose.yml`).

## Deploy (Vercel)

Variáveis necessárias:

- `DATABASE_URL` — Postgres (Neon / Vercel Postgres / similar)
- `AUTH_SECRET` — string longa aleatória
- `AUTH_TRUST_HOST=true`
- `NEXTAUTH_URL` — URL pública do deploy

Build de produção roda `prisma db push` + seed demo automaticamente.

## Documentação

Veja [`docs/README.md`](./docs/README.md).

## Scripts

- `npm run dev` — desenvolvimento
- `npm run db:setup` — schema + seed
- `npm run db:seed` — só seed
- `npm run build` — build de produção
- `npm run smoke` — smoke test de domínio
