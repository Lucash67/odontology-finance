# Visão geral do projeto

## Produto

Sistema web financeiro para consultório odontológico.

Nome temporário: **odontology-finance**

Objetivo: controlar pacientes, dentistas, tratamentos/orçamentos, recebíveis (parcelas e pagamentos), contas a pagar, inadimplência, fluxo financeiro, dashboard e, futuramente, lembretes/cobranças via WhatsApp.

## Contexto operacional atual

Hoje o controle é feito em planilha Excel (“CONTROLE DE BOLETOS”), com foco quase exclusivo em **recebíveis de pacientes** (orçamento + entrada + parcelas mensais).

Não há evidência clara na planilha de:

- contas a pagar / fornecedores;
- catálogo detalhado de procedimentos odontológicos;
- cadastro estruturado de pacientes (telefone, CPF, etc.);
- histórico imutável de pagamentos (só valores agregados por mês).

Esses módulos fazem parte do escopo desejado do sistema, mas precisam ser desenhados a partir de entrevistas + boas práticas, não só da planilha.

## Estado do repositório

V1 operacional implementada localmente (App Router + Prisma + PostgreSQL via Docker).

## Stack efetivamente utilizada

Prioridade: segurança, organização, escalabilidade, manutenção, separação frontend/backend, banco relacional, validação, logs, auditoria e controle de acesso.

### Proposta recomendada

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend | Next.js (App Router) + TypeScript + Tailwind | App web moderno, boa DX, tipagem |
| Backend / API | Next.js Route Handlers **ou** NestJS | Começar com Next full-stack reduz complexidade; migrar API para Nest se o domínio crescer |
| ORM | Prisma | Modelo relacional claro, migrações, tipagem |
| Banco | PostgreSQL | Adequado a financeiro, relatórios e integridade |
| Auth | Auth.js (NextAuth) ou Better Auth + roles | Controle de acesso por perfil |
| Validação | Zod | Contratos de entrada consistentes |
| Filas / jobs (fase WhatsApp) | Depois: BullMQ / cron | Só quando houver automação |
| Observabilidade | Logs estruturados + tabela `audit_logs` | Rastreabilidade financeira |

### Alternativa mais “separada”

- Frontend: Next.js
- Backend: NestJS + Prisma + PostgreSQL
- Útil se houver múltiplos clientes (mobile, integrações) cedo

**Decisão recomendada para Fase 1:** Next.js + TypeScript + Prisma + PostgreSQL (monólito modular), com pastas `domain/`, `modules/`, `infrastructure/`. Evitar microserviços no início.

## Princípios de arquitetura

1. **Não espelhar a planilha** (sem colunas JAN/FEV/MAR no banco).
2. **Parcelas como registros** independentes.
3. **Pagamentos como eventos** (histórico imutável; saldo derivado).
4. Separar **recebíveis** de **contas a pagar**.
5. Toda alteração financeira relevante deve gerar **auditoria**.
6. Dados pessoais de pacientes exigem cuidado (LGPD): acesso restrito, sem commit de planilha no git.

## Escopo desta etapa

Documentação e discovery apenas. Sem implementação de telas, APIs, WhatsApp, dashboard ou migração.

## Fora de escopo imediato

- Identidade visual / logo
- Deploy
- Integração WhatsApp
- Importação definitiva da planilha
- Decisões irreversíveis sem validação do cliente
