"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  Menu,
  X,
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[var(--bg)] lg:grid lg:grid-cols-[248px_1fr]">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <BrandLockup subtitle="finance" />
        <form action={signOutAction}>
          <button
            type="submit"
            aria-label="Sair"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--muted)]"
          >
            <LogOut size={16} />
          </button>
        </form>
      </header>

      {menuOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(288px,86vw)] flex-col bg-[var(--sidebar)] text-white transition-transform duration-200 ease-out lg:static lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:border-r lg:border-white/5",
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <BrandLockup inverted subtitle="finance" />
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--sidebar-muted)]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition duration-200",
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

        <div className="border-t border-white/5 px-5 py-4">
          <p className="text-[13px] font-semibold text-white">{userName}</p>
          <p className="text-[11px] text-[var(--sidebar-muted)]">{userRole}</p>
          <form action={signOutAction} className="mt-3">
            <button className="inline-flex items-center gap-2 text-[12px] text-[var(--sidebar-text)] transition hover:text-white">
              <LogOut size={14} /> Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
        <div className="sw-animate-fade mx-auto max-w-[1200px]">{children}</div>
      </main>
    </div>
  );
}
