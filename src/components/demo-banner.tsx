import { Info } from "lucide-react";

/** Banner fixo deixando claro que a base está vazia por ser versão demo. */
export function DemoBanner() {
  return (
    <div
      role="status"
      className="mb-5 flex gap-3 rounded-[var(--radius-card)] border border-[var(--brand)]/20 bg-[var(--brand-soft)] px-4 py-3 text-[13px] leading-relaxed text-[var(--brand-ink)]"
    >
      <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">Versão demo — base zerada de propósito</p>
        <p className="mt-0.5 opacity-90">
          Não há pacientes, tratamentos, recebíveis nem despesas cadastrados. Os indicadores em R$&nbsp;0,00
          existem porque esta é uma demonstração de portfólio, sem dados de nenhuma clínica ou operação real.
          Você pode cadastrar registros só para explorar o fluxo.
        </p>
      </div>
    </div>
  );
}
