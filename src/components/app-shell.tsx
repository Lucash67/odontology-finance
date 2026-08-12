"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ClipboardList,
  Wallet,
  Receipt,
  Building2,
  Tags,
  CreditCard,
  MessageCircle,
  LogOut,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/actions/auth";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/dentists", label: "Dentistas", icon: Stethoscope },
  { href: "/treatments", label: "Tratamentos", icon: ClipboardList },
  { href: "/receivables", label: "Recebíveis", icon: Wallet },
  { href: "/expenses", label: "Contas a pagar", icon: Receipt },
  { href: "/suppliers", label: "Fornecedores", icon: Building2 },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/payment-methods", label: "Métodos", icon: CreditCard },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/users", label: "Usuários", icon: UserCog },
];

export function AppShell({
  children,
  userName,
  userRole,
}: {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-[var(--line)] bg-[var(--bg-elevated)] lg:border-b-0 lg:border-r">
        <div className="px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            odontology-finance
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl leading-tight">
            Controle financeiro
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:overflow-visible">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition",
                  active
                    ? "bg-[var(--brand)] text-white"
                    : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]",
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-[var(--line)] px-5 py-4 lg:block">
          <p className="text-sm font-semibold">{userName}</p>
          <p className="text-xs text-[var(--muted)]">{userRole}</p>
          <form action={signOutAction} className="mt-3">
            <button className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)]">
              <LogOut size={14} /> Sair
            </button>
          </form>
        </div>
      </aside>
      <main className="px-4 py-6 sm:px-8">{children}</main>
    </div>
  );
}
