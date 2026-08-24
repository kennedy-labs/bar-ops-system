"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { href: "/worker/shift", label: "Start" },
  { href: "/worker/shift/opening", label: "Opening" },
  { href: "/worker/shift/active", label: "Active" },
  { href: "/worker/shift/closing", label: "Closing" },
  { href: "/worker/shift/result", label: "Result" },
];

export default function WorkerTopBar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentIdx = STEPS.findIndex((s) => pathname === s.href);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 bg-slate-900 text-white shadow">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Link href="/worker/shift" className="shrink-0 font-bold text-lg">
            Bar Ops
          </Link>

          {/* Shift step guide (linear) */}
          <nav className="flex items-center gap-1 overflow-x-auto text-xs">
            {STEPS.map((step, i) => (
              <Link
                key={step.href}
                href={step.href}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  i === currentIdx
                    ? "bg-indigo-600 text-white font-semibold"
                    : i < currentIdx
                    ? "text-indigo-300 hover:bg-slate-800"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                {i < currentIdx ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : i === currentIdx ? (
                  <span className="h-2 w-2 rounded-full bg-white" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                {step.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}