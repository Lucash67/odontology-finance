# Modelo de dados proposto

Princípio: **não** transformar colunas mensais da planilha em colunas do banco.

```
Patient → Treatment/Budget → PaymentPlan → Installments → Payments
```

---

## 1. Avaliação das entidades sugeridas

| Entidade | Necessária? | Justificativa |
|----------|-------------|---------------|
| `users` | **Sim** | Login e perfil de acesso |
| `patients` | **Sim** | Núcleo do recebível |
| `dentists` | **Sim** | Presente em praticamente todas as linhas |
| `treatments` | **Sim** | Representa o “contrato/orçamento” da linha |
| `budgets` | **Talvez / fase 2+** | Se orçamento tiver ciclo de aprovação separado do tratamento ativo; no início pode ser o próprio `treatments` com status `draft/approved` |
| `receivables` | **Opcional** | Pode ser view/conceito sobre o plano financeiro do tratamento; evitar duplicar `treatments` |
| `receivable_installments` | **Sim** | Cada parcela = 1 registro |
| `receivable_payments` | **Sim** | Eventos de pagamento com histórico |
| `expenses` | **Sim (fase payables)** | Não existe na planilha; necessário ao escopo |
| `expense_payments` | **Sim (fase payables)** | Pagamentos de despesas |
| `suppliers` | **Sim (fase payables)** | Fornecedores |
| `categories` | **Sim** | Categorias de despesa (e talvez receita) |
| `payment_methods` | **Sim** | Pix, dinheiro, cartão, boleto, transferência… |
| `whatsapp_messages` | **Sim (fase WhatsApp)** | Histórico de envios |
| `whatsapp_templates` | **Sim (fase WhatsApp)** | Modelos de mensagem |
| `notifications` | **Sim (depois)** | Fila interna de alertas (UI + WhatsApp) |
| `settings` | **Sim** | Dia padrão de vencimento, textos, flags |
| `audit_logs` | **Sim** | Obrigatório em sistema financeiro |

### Entidades adicionais recomendadas

| Entidade | Justificativa |
|----------|---------------|
| `clinics` / `organizations` | Se houver multi-unidade no futuro (mesmo que 1 registro agora) |
| `treatment_status_history` | Opcional; ou cobrir via `audit_logs` |
| `installment_schedules` / `payment_plans` | Plano financeiro do tratamento (entrada, N parcelas, 1º vencimento) |
| `patient_contacts` | Telefone/WhatsApp separados do nome |

---

## 2. Modelo relacional alvo (simplificado)

```text
users
patients ──< treatments >── dentists
               │
               └── payment_plans
                        │
                        └── receivable_installments ──< receivable_payments
                                                         │
                                                         └── payment_methods

suppliers ──< expenses ──< expense_payments
                 │
                 └── categories

whatsapp_templates
whatsapp_messages → patients / installments
notifications
settings
audit_logs
```

---

## 3. Campos essenciais (rascunho)

### patients
- id, full_name, document (CPF opcional), phone, whatsapp, email
- notes, active, created_at, updated_at

### dentists
- id, full_name, active

### treatments
- id, patient_id, dentist_id
- title/description (texto livre do tratamento)
- contracted_amount
- status (draft/active/paused/completed/cancelled)
- budget_date, clinical_notes
- external_ref / import_source (para migração)

### payment_plans
- id, treatment_id
- down_payment_amount, installments_count
- installment_amount, first_due_date, due_day
- status

### receivable_installments
- id, payment_plan_id, treatment_id, patient_id
- sequence_number, due_date, amount
- amount_paid (derivado ou cache), status
- notes

### receivable_payments
- id, installment_id, treatment_id, patient_id
- amount, paid_at, payment_method_id
- notes, created_by, voided_at (estorno)

### expenses / expense_payments / suppliers / categories
Ver [payables.md](./payables.md).

---

## 4. O que NÃO modelar como na planilha

| Anti-padrão planilha | Substituição |
|----------------------|--------------|
| Colunas JAN…DEZ | `installments.due_date` + agregações |
| `VALOR JÁ PAGO` como fonte da verdade | Soma de `receivable_payments` (+ entrada) |
| `A RECEBER` gravado | Campo calculado |
| Situação no meio do nome do paciente | Campos/status próprios |
| Uma aba por ano | Filtros por data; histórico contínuo |
| `N` em célula mensal | Ausência de parcela / status |

---

## 5. Estratégia de migração (só no backlog)

1. Importar dentistas únicos (normalizados).
2. Importar pacientes únicos (revisão humana de duplicatas).
3. Criar treatments a partir de linhas das abas operacionais.
4. Gerar parcelas a partir de `DATA ULTIMO`, qtd, valor e/ou meses preenchidos.
5. Converter valores mensais > 0 em pagamentos **estimados** (data = dia de vencimento do mês) — ⚠️ validar se mês = pago ou previsto.
6. Conciliar saldos com `A RECEBER` / `REST A PAGAR`.
7. Marcar registros importados com `import_batch_id`.

**Não executar migração nesta etapa.**
