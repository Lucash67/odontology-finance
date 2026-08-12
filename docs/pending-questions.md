# Dúvidas para validar com o cliente

Prioridade: **P0** bloqueia modelagem · **P1** importante · **P2** pode esperar

---

## Cadastro e operação

1. **[P0]** Quais pessoas vão usar o sistema e com quais permissões?
2. **[P0]** Existe cadastro atual de pacientes com telefone/CPF/e-mail, ou só o nome na planilha?
3. **[P1]** Um paciente pode ter mais de um tratamento ativo ao mesmo tempo? (a planilha sugere que sim)
4. **[P1]** O campo dentista é o responsável clínico, o que “fechou” o orçamento, ou ambos?

## Significado dos campos da planilha

5. **[P0]** Na coluna mensal (JAN…DEZ), o valor significa **pago**, **previsto**, ou os dois misturados?
6. **[P0]** O marcador `N` na aba ATIVOS significa “sem parcela”, “não pago”, ou outra coisa?
7. **[P0]** `VALOR JÁ PAGO` inclui a entrada? Em algumas linhas a fórmula inclui, em outras não.
8. **[P0]** `DATA ULTIMO` é a data da última parcela do plano ou do último pagamento realizado?
9. **[P1]** O que significa `LG PACIENTE`?
10. **[P1]** `FINAL/RC OK` = tratamento finalizado e recebíveis ok?
11. **[P1]** “BOLETOS” refere-se a boleto bancário de fato, ou é só o nome do controle de parcelas?
12. **[P1]** Por que existem fórmulas diferentes (`F/J` vs `I/J`) para valor da parcela? Qual é a regra correta?
13. **[P2]** A aba PREVISTOS ainda é usada no dia a dia?

## Regras financeiras

14. **[P0]** Dia de vencimento é sempre 05, ou varia por paciente?
15. **[P0]** Permite pagamento parcial de parcela?
16. **[P0]** Como tratar desistência / tratamento parado com saldo em aberto?
17. **[P1]** Há juros, multa ou desconto por antecipação?
18. **[P1]** Há renegociação frequente? Como é feita hoje?
19. **[P1]** Entrada pode ser parcelada?
20. **[P1]** Orçamento pode mudar depois de iniciado o tratamento?

## Contas a pagar

21. **[P0]** Quais despesas precisam entrar no sistema (categorias principais)?
22. **[P1]** Há rateio / pró-labore por dentista?
23. **[P1]** Despesas recorrentes (aluguel, software, limpeza) devem gerar parcelas automáticas?

## WhatsApp / cobrança

24. **[P0]** Já existe processo de cobrança por WhatsApp? Quem envia?
25. **[P0]** Pacientes autorizam mensagens de cobrança?
26. **[P1]** Quais textos padrão querem usar?
27. **[P1]** Em quantos dias após o vencimento deve cobrar?

## Migração

28. **[P0]** Qual aba é a “fonte da verdade” hoje: `BOLETOS ATIVOS 2026`?
29. **[P0]** Precisamos migrar histórico antigo (ATIVOS / 2025) ou só contratos em aberto?
30. **[P1]** Há duplicatas conhecidas de pacientes com nomes ligeiramente diferentes?
31. **[P1]** Existe outro sistema/planilha de caixa ou contas a pagar em paralelo?

## Produto

32. **[P2]** Nome definitivo do produto?
33. **[P2]** Precisa de acesso externo (dentista em casa) ou só na clínica?
34. **[P2]** Necessidade de emissão de recibo/NF?
