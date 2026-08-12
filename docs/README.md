# Documentação — odontology-finance

Nome temporário do produto: **odontology-finance** (neutro; identidade visual ainda não definida).

Sistema financeiro para consultório odontológico, destinado a substituir o controle operacional hoje feito na planilha `CONTROLE DE BOLETOS 2.xlsx`.

## Regra de execução

```
ANALISAR → DOCUMENTAR → BACKLOG → AGUARDAR AUTORIZAÇÃO → IMPLEMENTAR
```

Nenhuma implementação de produto deve avançar sem autorização explícita.

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [project-overview.md](./project-overview.md) | Visão geral, objetivos, escopo e stack proposta |
| [spreadsheet-analysis.md](./spreadsheet-analysis.md) | Análise completa da planilha do cliente |
| [business-rules.md](./business-rules.md) | Regras de negócio identificadas |
| [data-model.md](./data-model.md) | Entidades propostas e normalização |
| [receivables.md](./receivables.md) | Módulo de recebíveis, parcelas e pagamentos |
| [payables.md](./payables.md) | Contas a pagar / despesas |
| [whatsapp.md](./whatsapp.md) | Automações e histórico de WhatsApp (futuro) |
| [dashboard.md](./dashboard.md) | Indicadores e estrutura inicial do dashboard |
| [decisions.md](./decisions.md) | Decisões técnicas (tomadas e pendentes) |
| [pending-questions.md](./pending-questions.md) | Dúvidas para validar com o cliente |
| [roadmap.md](./roadmap.md) | Roadmap e backlog por fases |

## Status atual (V1 operacional)

- [x] Análise da planilha
- [x] Documentação inicial
- [x] Fundação (Next.js + Prisma + PostgreSQL + Auth)
- [x] V1 navegável (cadastros, recebíveis, payables, dashboard, WhatsApp simulado)
- [ ] Validação das dúvidas P0 com o cliente
- [ ] Migração da planilha (etapa separada)
- [ ] Integração WhatsApp real

## Fonte de referência

Planilha original (não alterar):

`C:\Users\lucas\Downloads\CONTROLE DE BOLETOS 2.xlsx`

A planilha **não** deve ser copiada literalmente para interface ou banco. Serve apenas como fonte de entendimento da operação.
