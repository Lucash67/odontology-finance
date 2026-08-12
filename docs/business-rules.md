# Regras de negócio identificadas

Status: **hipóteses a partir da planilha** + regras desejadas do briefing.  
Itens marcados com ⚠️ precisam confirmação do cliente ([pending-questions.md](./pending-questions.md)).

---

## 1. Domínio comercial

### RB-01 — Contrato financeiro por tratamento
Cada linha da planilha representa, na prática, um **contrato/orçamento** ligado a um paciente e a um dentista, com valor total e forma de pagamento.

### RB-02 — Um paciente, vários tratamentos
O mesmo paciente pode aparecer em múltiplas linhas → múltiplos tratamentos/orçamentos ativos ou históricos.

### RB-03 — Entrada opcional
`ENTRADA` pode ser zero. Quando > 0, reduz o saldo a parcelar.

### RB-04 — Parcelamento
Há quantidade de parcelas e valor da parcela. Padrão frequente: 3–12 parcelas; existem planos longos (20–30x).

### RB-05 — Vencimento padrão dia 05
Anotação “VENCIMENTO DIA 05”. ⚠️ Na aba legada existem outros dias (10, 15, 20, 25, 30). Confirmar se o dia é configurável por contrato.

### RB-06 — Controle por calendário
A operação atual pensa em “o que entra em cada mês”, não em lista de parcelas com status.

---

## 2. Cálculos financeiros (propostos para o sistema)

> Estas são as regras **alvo** do sistema. A planilha não as aplica de forma consistente.

### RB-10 — Valor contratado
```
contracted_amount = budget.total_amount
```

### RB-11 — Saldo a parcelar
```
amount_to_finance = contracted_amount - down_payment_amount - discounts
```
⚠️ Confirmar se existem descontos/bonificações.

### RB-12 — Geração de parcelas
Ao confirmar o plano:
- criar N registros em `receivable_installments`
- cada um com `due_date`, `amount`, `status=pending`
- soma das parcelas deve fechar o `amount_to_finance` (ajustar centavos na última parcela)

### RB-13 — Valor da parcela
```
base_installment = round(amount_to_finance / N, 2)
last_installment = amount_to_finance - base_installment * (N - 1)
```

### RB-14 — Pagamento
Todo recebimento gera `receivable_payment` com valor, data, método, vínculo à parcela (e opcionalmente ao contrato).

### RB-15 — Atualização de status da parcela
```
paid_total = sum(payments where installment_id = X)

if cancelled -> cancelled
else if paid_total <= 0 and due_date < today -> overdue
else if paid_total <= 0 -> pending
else if paid_total < amount -> partially_paid
else -> paid
```

### RB-16 — Saldos do contrato
```
total_paid = down_payment_recorded + sum(payments)
balance_due = contracted_amount - total_paid - writeoffs
```
Histórico de pagamentos **nunca** é apagado; estornos geram lançamento inverso / status cancelado com auditoria.

### RB-17 — A receber / previsto
- **A receber:** soma de parcelas `pending|partially_paid|overdue` (saldo remanescente)
- **Previsto do mês:** parcelas com `due_date` no mês
- **Recebido do mês:** pagamentos com `paid_at` no mês

---

## 3. Status de tratamento / contrato

Valores observados na planilha (sujos):

| Valor planilha | Interpretação candidata |
|----------------|-------------------------|
| (vazio) | Em andamento |
| FINALIZOU / FINALIZADO | Tratamento clínico concluído |
| FINAL/RC OK | Finalizado + recebíveis ok? ⚠️ |
| TRAT.PARADO | Tratamento pausado |
| DESISTIU | Desistência |
| CANCERLADO | Cancelado (typo) |
| LG PACIENTE | ⚠️ significado desconhecido |

Proposta de enum no sistema:

- `draft` — orçamento não aprovado
- `active` — em cobrança
- `paused` — tratamento/cobrança pausada
- `completed` — tratamento concluído (pode ainda ter saldo)
- `cancelled` — cancelado
- `written_off` — baixa / prejuízo (se aplicável)

⚠️ Separar status **clínico** de status **financeiro**.

---

## 4. Status de parcela (alvo)

- `pending`
- `paid`
- `overdue`
- `partially_paid`
- `cancelled`

Job diário (ou cálculo on-read) promove `pending` → `overdue` quando `due_date < today`.

---

## 5. Inadimplência

### RB-30 — Parcela inadimplente
Parcela com saldo > 0 e vencimento < hoje.

### RB-31 — Paciente inadimplente
Paciente com ≥ 1 parcela inadimplente em contratos ativos.

### RB-32 — Tratamento parado / desistência
Não implica automaticamente quitação. ⚠️ Definir política: continua cobrando? renegocia? cancela saldo?

---

## 6. Regras operacionais de UI/processo (futuras)

- Registrar pagamento sem apagar a parcela.
- Permitir pagamento parcial.
- Permitir quitação antecipada.
- Renegociação gera novo plano ou reprograma parcelas (com auditoria) — ⚠️ confirmar.
- Contas a pagar são módulo separado (sem misturar com recebíveis).

---

## 7. WhatsApp (futuro)

- Lembrete antes do vencimento
- Lembrete no dia
- Cobrança após atraso
- Histórico de mensagens obrigatório
- Opt-in / base legal ⚠️

Detalhes em [whatsapp.md](./whatsapp.md).

---

## 8. Permissões (propostas)

Perfis iniciais sugeridos:

- `admin` — tudo
- `financial` — lançamentos e relatórios
- `receptionist` — cadastros e registro de pagamentos
- `dentist_readonly` — opcional, só seus pacientes/produção

⚠️ Confirmar quem usa o sistema no consultório.
