# Módulo de contas a pagar

## Situação atual

A planilha analisada **não contém** contas a pagar, fornecedores nem despesas operacionais.

Este módulo faz parte do escopo desejado do sistema e será desenhado como domínio **separado** dos recebíveis.

## Objetivo

Controlar obrigações do consultório (aluguel, laboratório, materiais, pró-labore, impostos, etc.).

## Entidades

- `suppliers`
- `categories` (despesa)
- `expenses` (conta a pagar)
- `expense_payments`

## Campos alvo de uma despesa

- fornecedor
- categoria
- descrição
- valor
- vencimento
- status (`pending`, `paid`, `overdue`, `partially_paid`, `cancelled`)
- método de pagamento (quando pago)
- recorrência (`none`, `monthly`, `yearly`, …)
- observações
- anexos (futuro)

## Separação obrigatória

| Recebíveis | Contas a pagar |
|------------|----------------|
| Paciente / tratamento | Fornecedor / categoria |
| Entrada de caixa | Saída de caixa |
| Parcelas de orçamento | Despesas do consultório |

Dashboard pode cruzar os dois para **resultado**, mas os lançamentos não se misturam.

## Recorrência (proposta)

Ao marcar despesa mensal, o sistema gera próximas competências automaticamente ou via job — ⚠️ confirmar necessidade real do cliente.

## Pendências de discovery

Ver [pending-questions.md](./pending-questions.md) (lista de categorias, quem lança, se há pró-labore por dentista, etc.).
