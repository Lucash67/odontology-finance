# Decisões técnicas

Legenda: **DECIDIDO** · **ASSUNÇÃO REVERSÍVEL** · **PENDENTE**

---

## Decisões da discovery (Fase 0)

| ID | Decisão | Status |
|----|---------|--------|
| D-01 | Nome temporário do produto: `odontology-finance` | DECIDIDO |
| D-02 | Não espelhar colunas mensais no banco | DECIDIDO |
| D-03 | Parcelas e pagamentos como registros separados | DECIDIDO |
| D-04 | Separar recebíveis de contas a pagar | DECIDIDO |
| D-06 | Não versionar a planilha original no git (PII) | DECIDIDO |
| D-07 | Abas vazias da planilha serão ignoradas na migração | DECIDIDO |

---

## Decisões da V1 (Fase 1 + V1 operacional)

| ID | Decisão | Status | Notas |
|----|---------|--------|-------|
| D-10 | Stack: Next.js 15 + TypeScript + Prisma 6 + PostgreSQL 16 | DECIDIDO | Monólito modular em `src/domain` + App Router |
| D-11 | Auth: NextAuth (Auth.js) credentials + JWT + roles | DECIDIDO | Roles: `ADMIN`, `FINANCIAL`, `RECEPTIONIST` |
| D-12 | Orçamento = `treatments` (sem tabela `budgets` separada) | ASSUNÇÃO REVERSÍVEL | Status `DRAFT/ACTIVE/...` cobre o ciclo inicial |
| D-13 | Dia padrão de vencimento = **5**, configurável em `settings.defaultDueDay` e por plano (`dueDay`) | ASSUNÇÃO REVERSÍVEL | Responde P0 sem travar; cliente pode mudar |
| D-14 | Intervalo padrão entre parcelas = 1 mês (`intervalMonths`) | ASSUNÇÃO REVERSÍVEL | Editável na criação do plano |
| D-15 | Dashboard em **regime de caixa** (pagamentos na data) | ASSUNÇÃO REVERSÍVEL | Resultado = recebido − despesas pagas no período |
| D-16 | Centavos: última parcela absorve resto da divisão | DECIDIDO | `splitInstallments` |
| D-17 | PostgreSQL Docker na porta **5433** | DECIDIDO | Evita conflito com outros Postgres locais na 5432 |
| D-18 | WhatsApp: apenas estrutura + **simulação interna** | DECIDIDO | Sem provedor externo nesta V1 |
| D-19 | Recorrência de despesa: campo persistido; geração automática futura | ASSUNÇÃO REVERSÍVEL | V1 grava `NONE/MONTHLY/YEARLY` sem auto-gerar próximas |
| D-20 | Entrada do plano **não** gera parcela/pagamento automático | ASSUNÇÃO REVERSÍVEL | Entra no saldo do tratamento; pode virar pagamento depois |
| D-21 | Importação da planilha: só campos `importSource`/`externalRef` preparados | DECIDIDO | Migração em etapa separada |
| D-22 | UI alinhada ao template Stackwise (vídeo 2026-08-11): Inter, cream `#f7f6f2`, verde `#009050`, sidebar escura, cards com sombra suave, botões pill, fade-up | DECIDIDO | Referência visual do cliente |

---

## Ainda pendente (cliente / produto)

| ID | Tema |
|----|------|
| P-03 | Hospedagem |
| P-05 | Multi-clínica (`organization_id`) |
| P-08 | Provedor WhatsApp real |
| P-09 | Estratégia fina de migração da planilha |
| P-10 | LGPD / retenção |
| P-11 | Nome e identidade visual definitivos |
| P-12 | Todas as dúvidas P0 em `pending-questions.md` |

Assunções reversíveis acima podem ser ajustadas sem reescrever o núcleo, desde que a mudança seja feita antes da migração em massa da planilha.
