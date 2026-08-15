import { cn } from "@/lib/utils";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="sw-animate-in mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold tracking-tight text-[var(--ink)] sm:text-[32px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-card)] transition duration-300 ease-out sm:p-5",
        hover && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  tone = "brand",
  icon,
}: {
  label: string;
  value: string;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
  icon?: ReactNode;
}) {
  const tones = {
    brand: "border-l-[var(--brand)] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf9_100%)]",
    success: "border-l-[var(--success)] bg-[linear-gradient(180deg,#ffffff_0%,#f5fbf7_100%)]",
    warning: "border-l-[var(--warning)] bg-[linear-gradient(180deg,#ffffff_0%,#fffaf2_100%)]",
    danger: "border-l-[var(--danger)] bg-[linear-gradient(180deg,#ffffff_0%,#fff7f7_100%)]",
    neutral: "border-l-[#cfcfcf] bg-white",
  } as const;

  const iconBg = {
    brand: "bg-[var(--brand-soft)] text-[var(--brand)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
    neutral: "bg-[var(--beige)] text-[var(--muted)]",
  } as const;

  return (
    <Card className={cn("!p-4 border-l-[3px]", tones[tone])} hover>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[var(--muted)]">{label}</p>
          <p className="mt-2 break-words text-[20px] font-semibold tracking-tight text-[var(--ink)] sm:text-[24px]">
            {value}
          </p>
        </div>
        {icon ? (
          <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl", iconBg[tone])}>
            {icon}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "beige";
}) {
  const styles = {
    primary:
      "bg-[var(--brand)] text-white shadow-sm hover:bg-[var(--brand-hover)] hover:shadow-md active:translate-y-px",
    secondary:
      "bg-[var(--brand-soft)] text-[var(--brand-ink)] hover:bg-[#d7f0e4]",
    beige:
      "bg-[var(--beige)] text-[var(--ink)] hover:bg-[var(--beige-hover)]",
    danger: "bg-[var(--danger)] text-white hover:opacity-90",
    ghost: "bg-transparent text-[var(--ink)] hover:bg-black/[0.04]",
  } as const;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 py-2.5 text-[13px] font-semibold transition duration-200 disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-white px-3.5 py-2.5 text-[14px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-2)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-soft)]",
        props.className,
      )}
      {...props}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-white px-3.5 py-2.5 text-[14px] text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-soft)]",
        props.className,
      )}
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-white px-3.5 py-2.5 text-[14px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted-2)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-soft)]",
        props.className,
      )}
      {...props}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[12px] font-medium text-[var(--muted)]">
      {children}
    </label>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
  dot?: boolean;
}) {
  const map = {
    neutral: "bg-[var(--beige)] text-[var(--ink)]",
    success: "bg-[var(--success-soft)] text-[var(--brand-ink)]",
    warning: "bg-[var(--warning-soft)] text-[#9a5b07]",
    danger: "bg-[var(--danger-soft)] text-[#b42318]",
    brand: "bg-[var(--brand-soft)] text-[var(--brand-ink)]",
  } as const;
  const dots = {
    neutral: "bg-[var(--muted-2)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    danger: "bg-[var(--danger)]",
    brand: "bg-[var(--brand)]",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] font-semibold",
        map[tone],
      )}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} /> : null}
      {children}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--line)] bg-[var(--bg-warm)]/50 px-6 py-14 text-center">
      <p className="text-[18px] font-semibold text-[var(--ink)]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[14px] text-[var(--muted)]">{description}</p>
    </div>
  );
}

export function Flash({ message, tone = "success" }: { message?: string; tone?: "success" | "error" }) {
  if (!message) return null;
  return (
    <div
      className={cn(
        "sw-animate-fade mb-4 rounded-[var(--radius-control)] px-4 py-3 text-[13px] font-medium",
        tone === "success"
          ? "bg-[var(--success-soft)] text-[var(--brand-ink)]"
          : "bg-[var(--danger-soft)] text-[#b42318]",
      )}
    >
      {message}
    </div>
  );
}

export function IconTile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--brand)] text-white shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
