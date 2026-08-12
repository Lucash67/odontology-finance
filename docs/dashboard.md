# Dashboard — estrutura inicial (não implementar agora)

## Objetivo

Visão diária/mensal da saúde financeira do consultório.

## KPIs prioritários

### Recebíveis
- Total a receber (saldo aberto)
- Recebimentos do dia
- Recebimentos do mês
- Recebimentos futuros (previsão)
- Valores em atraso
- Total recebido (período filtrável)
- Quantidade de parcelas em atraso
- Quantidade de pacientes inadimplentes

### Contas a pagar
- Total de despesas (período)
- Despesas a vencer / vencidas
- Despesas pagas no mês

### Resultado
- Resultado financeiro do período ≈ recebimentos − despesas pagas  
  ⚠️ Definir regime (caixa vs competência).

## Filtros

- Período (dia / mês / intervalo)
- Dentista
- Status
- Método de pagamento

## Gráficos sugeridos (fase posterior)

1. Recebido × previsto (últimos 12 meses)
2. Inadimplência ao longo do tempo
3. Composição por método de pagamento
4. Despesas por categoria
5. Resultado mensal

## Widgets de ação

- Parcelas que vencem hoje
- Top inadimplentes
- Atalho para registrar pagamento
- Alertas de falha de WhatsApp (futuro)

## Fonte dos números

Tudo derivado de parcelas + pagamentos + despesas — **não** de colunas mensais estáticas.

## Correspondência com a planilha

| Ideia na planilha | No dashboard |
|-------------------|--------------|
| `SUM` da coluna `A RECEBER` | Total a receber |
| Somas JAN…DEZ | Previsto/realizado por mês |
| Abas PREVISTOS | Gráfico de previsão |
| Situações manuais | Cards de inadimplência calculada |
