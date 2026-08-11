"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudSun, Crosshair } from "lucide-react";

const TABS = [
  { href: "/", label: "Forecast", icon: CloudSun },
  { href: "/hunting", label: "Hunting", icon: Crosshair },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-1 rounded-lg border border-border bg-bg-elevated p-1"
      aria-label="Main"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 font-mono text-xs transition-colors touch-manipulation ${
              active
                ? "bg-accent/15 text-accent"
                : "text-text-muted hover:text-text hover:bg-bg-card"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
