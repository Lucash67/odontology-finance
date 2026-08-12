# Roadmap e backlog

Estratégia atual: **ANALISAR → ESTRUTURAR → IMPLEMENTAR V1 COMPLETA → VALIDAR → REFINAR**

---

## Fase 0 — Discovery ✅

- [x] Análise da planilha
- [x] Documentação inicial
- [x] Backlog
- [ ] Validar dúvidas P0 com o cliente

---

## Fase 1 — Fundação ✅ (V1)

- [x] Next.js + TypeScript + Prisma + PostgreSQL
- [x] Docker Compose (Postgres :5433)
- [x] Auth (NextAuth credentials) + roles
- [x] Settings (dia padrão de vencimento)
- [x] Audit logs em operações financeiras/cadastros
- [x] Seed de desenvolvimento
- [x] README de setup

---

## V1 operacional ✅ (entregue nesta autorização)

### Cadastros
- [x] Login
- [x] Usuários (ADMIN cria)
- [x] Pacientes (+ detalhe)
- [x] Dentistas
- [x] Categorias
- [x] Fornecedores
- [x] Métodos de pagamento

### Recebíveis
- [x] Tratamentos
- [x] Plano financeiro + geração de parcelas
- [x] Listagem de recebíveis / filtros
- [x] Registro de pagamentos (histórico)
- [x] Saldo/status calculados + overdue

### Contas a pagar
- [x] Despesas + vencimento + status
- [x] Pagamentos de despesas
- [x] Campo de recorrência (sem auto-geração ainda)

### Dashboard
- [x] KPIs reais do banco
- [x] Gráfico recebido × despesas
- [x] Parcelas vencidas / próximos vencimentos

### WhatsApp (preparação)
- [x] Templates + histórico
- [x] Simulação interna de envio
- [ ] Integração real com provedor

---

## Próximas fases

### Validação / refine V1
- [ ] Responder dúvidas P0
- [ ] Ajustar assunções reversíveis (entrada, recorrência, regime)
- [ ] Estorno de pagamentos na UI
- [ ] Soft-delete / edição completa de cadastros
- [ ] Testes automatizados de UI
- [ ] CI (lint/typecheck/build)

### Fase 6 — WhatsApp real
- [ ] Escolher provedor
- [ ] Opt-in / janelas de envio
- [ ] Jobs D-n / D0 / D+n

### Fase 7 — Migração da planilha
- [ ] Script dry-run
- [ ] Deduplicação de pacientes
- [ ] Reconciliação de saldos
- [ ] Importação assistida

### Fase 8 — Produção
- [ ] Deploy + backups
- [ ] LGPD
- [ ] Nome/identidade definitivos
- [ ] Hardening de segurança

---

## Critério V1 (checklist)

- [x] LOGIN → paciente → tratamento → plano → parcelas → pagamento → saldo → vencidas → dashboard
- [x] Fornecedor → despesa → vencimento → pagamento → resultado
- [x] Dados persistidos no PostgreSQL
- [x] Sem mock no fluxo real após seed
