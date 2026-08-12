export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Split amount into N installments; last installment absorbs remainder cents. */
export function splitInstallments(total: number, count: number) {
  if (count <= 0) throw new Error("Quantidade de parcelas inválida");
  const base = roundMoney(total / count);
  const amounts = Array.from({ length: count }, () => base);
  const sumBase = roundMoney(base * (count - 1));
  amounts[count - 1] = roundMoney(total - sumBase);
  return amounts;
}
