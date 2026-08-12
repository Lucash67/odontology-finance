# odontology-finance

Sistema financeiro para consultório odontológico (nome temporário).

## Stack

- Next.js 15 (App Router) + TypeScript
- Prisma 6 + PostgreSQL 16 (Docker)
- NextAuth (credentials) + roles
- Tailwind CSS 4
- Zod / date-fns / Recharts

## Setup rápido

```bash
# 1) Banco
docker compose up -d

# 2) Dependências
npm install

# 3) Schema + seed
npm run db:setup

# 4) App
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

### Login seed

| Usuário | Senha | Role |
|---------|-------|------|
| admin@clinic.dev | admin123 | ADMIN |
| financeiro@clinic.dev | financeiro123 | FINANCIAL |
| recepcao@clinic.dev | recepcao123 | RECEPTIONIST |

PostgreSQL do projeto: `localhost:5433` (evita conflito com outros Postgres locais).

## Documentação

Veja [`docs/README.md`](./docs/README.md).

## Scripts

- `npm run dev` — desenvolvimento
- `npm run db:setup` — `prisma db push` + seed
- `npm run db:seed` — apenas seed
- `npm run build` — build de produção
