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
import { BrandLockup } from "@/components/brand";

const groups = [
  {
    label: "Operações",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/patients", label: "Pacientes", icon: Users },
      { href: "/dentists", label: "Dentistas", icon: Stethoscope },
      { href: "/treatments", label: "Tratamentos", icon: ClipboardList },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/receivables", label: "Recebíveis", icon: Wallet },
      { href: "/expenses", label: "Contas a pagar", icon: Receipt },
      { href: "/suppliers", label: "Fornecedores", icon: Building2 },
      { href: "/categories", label: "Categorias", icon: Tags },
      { href: "/payment-methods", label: "Métodos", icon: CreditCard },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
      { href: "/users", label: "Usuários", icon: UserCog },
    ],
  },
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
    <div className="min-h-screen bg-[var(--bg)] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-white/5 bg-[var(--sidebar)] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/5">
        <div className="px-5 py-5">
          <BrandLockup inverted subtitle="finance" />
        </div>

        <nav className="space-y-5 px-3 pb-4 lg:overflow-y-auto lg:pb-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--sidebar-muted)]">
                {group.label}
              </p>
              <div className="flex gap-1 overflow-x-auto lg:block lg:space-y-0.5 lg:overflow-visible">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium whitespace-nowrap transition duration-200",
                        active
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-white",
                      )}
                    >
                      <Icon
                        size={16}
                        className={cn(active ? "text-[var(--brand)]" : "text-[var(--sidebar-muted)]")}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-white/5 px-5 py-4 lg:block">
          <p className="text-[13px] font-semibold text-white">{userName}</p>
          <p className="text-[11px] text-[var(--sidebar-muted)]">{userRole}</p>
          <form action={signOutAction} className="mt-3">
            <button className="inline-flex items-center gap-2 text-[12px] text-[var(--sidebar-text)] transition hover:text-white">
              <LogOut size={14} /> Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="sw-animate-fade mx-auto max-w-[1200px]">{children}</div>
      </main>
    </div>
  );
}
