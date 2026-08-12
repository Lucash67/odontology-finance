# Módulo de recebíveis

## Objetivo

Controlar o dinheiro a receber de pacientes por tratamento/orçamento, com parcelas individuais e histórico de pagamentos.

## Fluxo alvo

```text
Paciente
  → Tratamento (valor contratado)
    → Entrada
    → Plano (N parcelas, vencimentos)
      → Parcelas (status)
        → Pagamentos (eventos)
```

## Conceitos

| Conceito | Descrição |
|----------|-----------|
| Tratamento / orçamento | Contrato comercial |
| Entrada | Pagamento inicial (pode ser 0) |
| Parcela | Obrigação com vencimento e valor |
| Pagamento | Evento que quita total/parcialmente uma parcela |
| Saldo | Derivado; não é fonte primária |

## Status de parcela

| Status | Quando |
|--------|--------|
| `pending` | Em aberto, ainda não venceu |
| `overdue` | Em aberto, já venceu |
| `partially_paid` | Pago parcial |
| `paid` | Quitada |
| `cancelled` | Cancelada (renegociação/cancelamento) |

Ajustável após validação com o cliente.

## Operações essenciais (backlog)

1. Criar tratamento + plano e gerar parcelas.
2. Registrar entrada.
3. Registrar pagamento (total/parcial).
4. Estornar pagamento (com auditoria).
5. Listar vencimentos do dia/mês.
6. Listar inadimplentes.
7. Renegociar / reprogramar (definir regra).
8. Cancelar saldo remanescente (com motivo).

## Campos mínimos no registro de pagamento

- valor
- data
- parcela relacionada
- paciente (desnormalizado ou via join)
- tratamento
- método de pagamento
- observação
- usuário que registrou

## Relação com a planilha

| Planilha | Sistema |
|----------|---------|
| ORÇAMENTO | `treatments.contracted_amount` |
| ENTRADA | pagamento tipo down_payment / campo do plano |
| PARCELAS / VALOR DA PARC | geração de `receivable_installments` |
| JAN…DEZ | parcelas + pagamentos datados |
| REST A PAGAR / A RECEBER | calculados |
| DATA ULTIMO | última `due_date` (ou derivado) |
| SITUACAO | status do tratamento (separado do financeiro) |

## Relatórios do módulo

- Contas a receber por período
- Inadimplência por paciente/parcela
- Recebimentos do dia/mês
- Previsão de caixa (parcelas futuras)
- Produção / carteira por dentista (se desejado)
