export const installmentStatusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  OVERDUE: "Vencida",
  PARTIALLY_PAID: "Parcial",
  CANCELLED: "Cancelada",
};

export const expenseStatusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  OVERDUE: "Vencida",
  PARTIALLY_PAID: "Parcial",
  CANCELLED: "Cancelada",
};

export const treatmentStatusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export function statusTone(status: string): "neutral" | "success" | "warning" | "danger" | "brand" {
  if (status === "PAID" || status === "COMPLETED") return "success";
  if (status === "OVERDUE") return "danger";
  if (status === "PARTIALLY_PAID" || status === "PAUSED") return "warning";
  if (status === "ACTIVE" || status === "PENDING") return "brand";
  return "neutral";
}
