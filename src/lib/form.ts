export function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function formNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").replace(",", ".");
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`Campo numérico inválido: ${key}`);
  return n;
}

export function formDate(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "");
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) throw new Error(`Data inválida: ${key}`);
  return d;
}
