# Análise da planilha — CONTROLE DE BOLETOS 2.xlsx

Arquivo analisado (somente leitura):  
`C:\Users\lucas\Downloads\CONTROLE DE BOLETOS 2.xlsx`

A planilha original **não foi alterada**.

---

## 1. Abas identificadas

| # | Aba | Conteúdo aparente | Uso |
|---|-----|-------------------|-----|
| 1 | **BOLETOS 2025** | Controle principal 2025 (~127 contratos) | Histórico / operação 2025 |
| 2 | **BOLETOS ATIVOS 2026** | Controle principal 2026 (~164 contratos) | Operação atual |
| 3 | **Página38** | Vazia | Ruído / residual |
| 4 | **PREVISTOS** | Resumo mensal + cópia operacional semelhante a 2026 | Projeção + espelho |
| 5 | **Página39** | Vazia | Ruído |
| 6 | **Página37** | Vazia | Ruído |
| 7 | **ATIVOS** | Layout antigo (~65 contratos), meses com “N” | Histórico legado |
| 8 | **TOTAL FECHADO** | Vazia | Placeholder |
| 9 | **BOLETO QUITADO** | Estrutura de quitados; quase sem dados | Arquivo de quitados (subutilizado) |

**Abas úteis de fato:** `BOLETOS 2025`, `BOLETOS ATIVOS 2026`, `PREVISTOS`, `ATIVOS`, `BOLETO QUITADO`.

---

## 2. Colunas por aba

### 2.1 BOLETOS 2025 / BOLETOS ATIVOS 2026 (layout moderno)

Cabeçalho na linha 4. Título: “CONTROLE DE BOLETOS”. Nota: “VENCIMENTO DIA 05”.

| Coluna | Campo | Significado interpretado |
|--------|-------|--------------------------|
| A | PACIENTE | Nome do paciente |
| B | SITUACAO | Status clínico/comercial do tratamento |
| C | DENTISTA | Dentista responsável |
| D | DATA ORÇA | Data do orçamento |
| E | DATA ULTIMO | Data da última parcela prevista / último vencimento |
| F | ORÇAMENTO | Valor total contratado |
| G | ENTRADA | Valor de entrada |
| H | VALOR JÁ PAGO | Total já pago (manual ou fórmula) |
| I | REST A PAGAR | Saldo residual do contrato |
| J | PARCELAS | Quantidade de parcelas |
| K | VALOR DA PARC | Valor unitário da parcela |
| L | A RECEBER | Saldo ainda a receber no ano/controle |
| M–X | JAN…DEZ | Valor “previsto/recebido” por mês (agregado) |
| Y | JANEIRO (só 2025) | Extensão irregular para mês seguinte |

Há linhas de cabeçalho repetidas no meio da planilha (blocos), o que quebra a leitura contínua.

### 2.2 PREVISTOS

- Topo: tabela de previsão mensal (mês + ano + `SUM` das colunas mensais).
- Abaixo (~linha 26): cópia do mesmo layout de boletos (paciente, dentista, orçamento… + meses).
- Fórmulas de resumo quebradas: vários `=SUM(#REF!)`.

### 2.3 ATIVOS (layout legado)

| Coluna | Campo |
|--------|-------|
| A | DATA VENCIMENTO (dia do mês: 5, 10, 15, 20, 25, 30) |
| B | PACIENTE |
| C | DENTISTA |
| D | DATA ORCA |
| E | DATA ULTIMO |
| F | ORÇAMENTO |
| G | VALOR A PAGAR |
| H | QDE (ex.: `10X`, `08X`) |
| I | ENTRADA |
| J–U | Meses do ano (valores ou `N`) |
| V–AC | Continuação de meses no ano seguinte |

Marcador **`N`** = mês sem parcela / não aplicável / não pago (ambíguo — confirmar).

### 2.4 BOLETO QUITADO

Mesmo espírito do legado: vencimento, paciente, dentista, valores, parcelas, entrada, meses. Quase vazio (1 registro observado).

---

## 3. Relacionamentos implícitos

```
Dentista 1──* Contrato/Orçamento *──1 Paciente
                  │
                  ├── Entrada (valor)
                  ├── N parcelas (quantidade + valor)
                  └── Valores mensais (JAN…DEZ) ≈ parcelas/pagamentos do período
```

Observações:

- **Paciente pode ter múltiplas linhas** (= múltiplos tratamentos/orçamentos).
- Não há ID; relacionamento é por **nome textual**.
- Nome do paciente às vezes inclui anotações (`(PAGO)`, `(PAGOU 5)`, `(ANABELA)`, `1` no final).
- Não há entidade explícita de “pagamento” nem de “boleto bancário” (apesar do nome “BOLETOS”).
- Não há ligação formal entre abas (sem chaves; overlap por nome).

Sobreposição aproximada de pacientes (nomes normalizados):

| Par de abas | Pacientes em comum |
|-------------|--------------------|
| 2025 ∩ 2026 | ~69 |
| 2026 ∩ PREVISTOS | ~144 |
| 2025 ∩ PREVISTOS | ~83 |
| ATIVOS ∩ 2025 | ~20 |

`PREVISTOS` é em grande parte espelho/projeção de `BOLETOS ATIVOS 2026`.

---

## 4. Fórmulas e cálculos

### 4.1 Padrões principais (abas modernas)

| Campo | Fórmulas observadas | Interpretação |
|-------|---------------------|---------------|
| REST A PAGAR | `=F-G` ou `=F-G-H` | Orçamento − entrada (− já pago) |
| VALOR DA PARC | `=I/J` ou `=F/J` | Saldo/parcelas **ou** orçamento/parcelas |
| A RECEBER | `=I - SUM(meses)` ou `=F - H - SUM(meses)` ou `=F - G - H - SUM(meses)` | Saldo após abater meses |
| VALOR JÁ PAGO | às vezes `=G + SUM(meses)` | Entrada + parcelas do ano |
| Totais | `=SUM(L:L)`, `=SUM(M27:M212)` | Totais de coluna / previsão mensal |

### 4.2 Inconsistência crítica de fórmula

O cálculo de parcela e de saldo **não é uniforme**:

- Às vezes parcela = `orçamento / qtd`
- Às vezes parcela = `restante / qtd`
- Às vezes `REST A PAGAR` ignora `VALOR JÁ PAGO`
- Centavos residuais (`0.68`, `0.06`) por arredondamento de divisão

### 4.3 PREVISTOS

- Resumo mensal com vários `#REF!` (links quebrados).
- Totais mensais ainda calculam em parte (`SUM` das colunas de meses).

### 4.4 ATIVOS

- Totais por mês com `SUM` / `SUBTOTAL`.
- Pouca fórmula por linha; muito valor “hardcoded” / texto monetário.

---

## 5. Padrões de negócio implícitos

1. **Modelo comercial dominante:** orçamento odontológico parcelado com entrada opcional.
2. **Vencimento padrão:** dia **05** (há também 10/15/20/25/30 na aba ATIVOS).
3. **Controle visual por ano-calendário** com colunas mensais.
4. **Um contrato ≈ uma linha** (paciente + dentista + valores).
5. **Situação do tratamento** é preenchida de forma irregular (`FINALIZOU`, `FINALIZADO`, `FINAL/RC OK`, `TRAT.PARADO`, `DESISTIU`, `CANCERLADO` [typo], `LG PACIENTE`).
6. Dentista principal: **Dr. Ruy**; também Henrique, Camille, Rubens, Carlos (legado).
7. Parcelamentos típicos: 3–12x; há casos longos (20x, 29x, 30x).
8. Entrada frequentemente **zero**.
9. “Boleto” parece significar **parcela a receber**, não necessariamente boleto bancário registrado.
10. Quitação deveria ir para aba própria, mas isso quase não é usado.
11. Anotações operacionais no nome do paciente substituem campos estruturados.

---

## 6. Inconsistências e problemas

| Problema | Impacto |
|----------|---------|
| Layout ano-em-colunas | Não escala; difícil inadimplência real por parcela |
| Fórmulas divergentes | Saldos e parcelas podem estar errados |
| Datas em texto livre (`05\|JULHO\|2026`, `05/06\2025`, `05\\10\\2024`) | Parsing frágil |
| Valores como texto (`R$1.000,00`, `R$1.000.00`, `R$.464,00`) | Totais e tipos inconsistentes |
| Marcador `N` vs `0` vs vazio | Semântica ambígua |
| Cabeçalhos repetidos no meio | Duplica “PACIENTE/DENTISTA” como se fossem dados |
| Nomes de dentista não normalizados (`DR RUY` vs `DR.RUY` vs `Dr.Ruy`) | Cadastro sujo |
| Typos de status (`CANCERLADO`) | Relatórios ruins |
| Paciente com anotações no nome | Impede chave estável |
| Mesmo paciente em várias abas sem sincronização | Risco de divergência |
| `#REF!` em PREVISTOS | Projeção quebrada |
| Abas vazias / quitados subutilizados | Processo incompleto |
| Outlier de orçamento muito alto em 2026/PREVISTOS (possível lixo/fórmula) | Distorce totais |
| Não há data real de pagamento | Só “valor no mês” |
| Não há método de pagamento | Pix/dinheiro/cartão/boleto desconhecido |
| Não há telefone/WhatsApp | Impede cobrança automatizada sem cadastro novo |
| Contas a pagar inexistentes | Escopo novo no sistema |

---

## 7. Histórico vs operacional

| Conjunto | Classificação | Notas |
|----------|---------------|-------|
| ATIVOS | Histórico / legado | Layout antigo; base 2023–2024 |
| BOLETOS 2025 | Histórico recente + contratos longos | Muitos saldos ainda abertos |
| BOLETOS ATIVOS 2026 | **Operacional atual** | Principal fonte de migração viva |
| PREVISTOS | Operacional + projeção | Espelho; parte quebrada |
| BOLETO QUITADO | Histórico pretendido | Quase sem uso |
| Página37/38/39, TOTAL FECHADO | Irrelevante | Ignorar na migração |

Contratos longos atravessam anos (ex.: orçamento 2024 com última parcela em 2026/2027) — o sistema não pode “resetar” por aba anual.

---

## 8. O que deveria virar entidade

Ver detalhe em [data-model.md](./data-model.md). Resumo:

- Paciente, Dentista, Tratamento/Orçamento, Plano financeiro, Parcela, Pagamento
- Status de tratamento e de parcela
- Método de pagamento, categorias, fornecedores (para payables — novo)
- Usuários, auditoria, settings, WhatsApp (futuro)

**Não** virar entidade: colunas JAN…DEZ, abas vazias, “PREVISTOS” como tabela espelho.

---

## 9. Normalização necessária

1. Nomes de pacientes (trim, case, remover sufixos operacionais).
2. Dentistas (cadastro único).
3. Datas (ISO `YYYY-MM-DD`).
4. Valores monetários (`numeric(12,2)`).
5. Situações → enum controlado.
6. Meses → linhas de `installments` + `payments`.
7. Um paciente / múltiplos tratamentos.
8. Separar “valor previsto da parcela” de “valor efetivamente pago”.

---

## 10. Regras de cálculo observadas (para redesenhar)

Ver [business-rules.md](./business-rules.md) e [receivables.md](./receivables.md).

Síntese da intenção operacional (não da fórmula literal):

```
valor_contratado = orçamento
saldo_contratado = orçamento - entrada - total_pago_em_parcelas
valor_parcela ≈ saldo_a_parcelar / quantidade_parcelas
a_receber = soma das parcelas em aberto
```

A planilha mistura “previsto no mês” com “pago no mês”. O sistema deve separar.

---

## 11. Inadimplência na planilha

Não há status explícito `overdue`. Sinais possíveis:

- `DATA ULTIMO` no passado com `A RECEBER` > 0
- Mês com valor previsto e sem evidência de pagamento (mas o modelo mensal não registra atraso)
- Situações `TRAT.PARADO`, `DESISTIU`, `LG PACIENTE`
- Anotações “PAGOU N” sugerindo acompanhamento manual

**Conclusão:** inadimplência hoje é inferida visualmente, não calculada.

---

## 12. Volumes aproximados

| Aba | Linhas com paciente | Pacientes únicos (aprox.) |
|-----|---------------------|---------------------------|
| BOLETOS 2025 | ~127 | ~118 |
| BOLETOS ATIVOS 2026 | ~164 | ~159 |
| PREVISTOS | ~174 | ~165 |
| ATIVOS | ~65 | ~63 |
| BOLETO QUITADO | ~1 | ~1 |

Orçamentos típicos: centenas a dezenas de milhares de reais. Entrada zero é comum (~25–30% das linhas nas abas modernas).

---

## 13. Conclusão da análise

A planilha é um **controle anual de carteira de recebíveis odontológicos**, centrado em orçamento + parcelamento, mantido de forma semi-manual com fórmulas inconsistentes.

O sistema deve:

1. Normalizar o domínio em entidades relacionais.
2. Tratar cada parcela como registro.
3. Registrar pagamentos como eventos.
4. Calcular saldos e atraso automaticamente.
5. Migrar com cuidado (deduplicação + validação humana).
6. Não tentar reproduzir abas JAN–DEZ na UI principal.
