import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-6 w-6", className)}
      aria-hidden
    >
      <path
        d="M12 3.2 4.8 7.2v9.6L12 20.8l7.2-4V7.2L12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.2v17.6M4.8 7.2 12 11.2l7.2-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandLockup({
  inverted = false,
  subtitle,
}: {
  inverted?: boolean;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("text-[var(--brand)]", inverted && "text-[var(--brand)]")}>
        <BrandMark />
      </span>
      <div>
        <p className={cn("text-[15px] font-semibold tracking-tight", inverted ? "text-white" : "text-[var(--ink)]")}>
          odontology
        </p>
        {subtitle ? (
          <p className={cn("text-[11px] leading-none", inverted ? "text-[var(--sidebar-muted)]" : "text-[var(--muted)]")}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
