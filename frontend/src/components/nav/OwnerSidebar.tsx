"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Boxes,
  Wallet,
  Receipt,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

type NavItem = {
  href: string;
  label: string;
  icon: any;
  built: boolean;
};

const ITEMS: NavItem[] = [
  { href: "/owner/dashboard", label: "Overview", icon: LayoutDashboard, built: true },
  { href: "/owner/reports", label: "Reports", icon: BarChart3, built: true },
  { href: "/owner/stock", label: "Stock", icon: Boxes, built: true },
  { href: "/owner/payments", label: "Payments", icon: Wallet, built: true },
  { href: "/owner/discrepancies", label: "Discrepancies", icon: Receipt, built: false },
  { href: "/owner/management", label: "Management", icon: Users, built: true },
];

export default function OwnerSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white">
        <div className="px-6 py-5">
          <div className="text-xl font-bold tracking-tight">Bar Ops</div>
          <div className="text-xs text-slate-400 mt-1">Owner Workspace</div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <div key={item.href}>
                {item.built ? (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded px-3 py-2 text-sm ${
                      active
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 rounded px-3 py-2 text-sm text-slate-500 cursor-not-allowed opacity-70">
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    <span className="rounded-full bg-slate-700 px-2 text-[10px] text-slate-400">Soon</span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="rounded-full bg-indigo-600 h-8 w-8 grid place-items-center text-white text-xs mr-2">
              {(user?.name || "O")[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{user?.name || "Owner"}</div>
              <div className="text-[11px] text-slate-400">{user?.businessId || "joypub"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 sticky top-0 z-20">
        <div className="text-lg font-bold">Bar Ops</div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-white"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setOpen(false)} />
      )}
      {open && (
        <div className="md:hidden fixed left-0 top-0 h-full w-64 bg-slate-900 text-white z-40 shadow-xl">
          <div className="px-6 py-3 flex justify-between">
            <div className="text-lg font-bold">Menu</div>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 px-3 py-2">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <div key={item.href}>
                  {item.built ? (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded px-3 py-2 text-sm ${
                        active ? "bg-indigo-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-3 rounded px-3 py-2 text-sm text-slate-500 opacity-70 cursor-not-allowed">
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      <span className="rounded-full bg-slate-700 px-1 text-[10px] text-slate-400">Soon</span>
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}