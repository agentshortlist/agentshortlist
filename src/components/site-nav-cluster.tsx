"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FluidHover } from "@/components/fluid-hover";

// Menú central (a partir de 1100 px): grupos separados por dos puntos decorativos, azul y rojo.
// La placa con muelle se desliza entre enlaces y se apaga cuando el puntero está sobre un punto.
type Entry = { href: string; label: string; match?: string } | "dot-start" | "dot-end";

const ENTRIES: Entry[] = [
  { href: "/best/coding", label: "Rankings", match: "/best" },
  { href: "/categories/coding-agents", label: "Categories", match: "/categories" },
  "dot-start",
  { href: "/verified", label: "Verified", match: "/verified" },
  { href: "/check", label: "Check", match: "/check" },
  { href: "/pick", label: "Pick", match: "/pick" },
  { href: "/compare/live", label: "Compare", match: "/compare" },
  "dot-end",
  { href: "/#map", label: "Map" },
  { href: "/methodology", label: "Methodology", match: "/methodology" },
];

export function SiteNavCluster({ blog = false }: { blog?: boolean }) {
  const pathname = usePathname() ?? "/";
  return (
    <nav aria-label="Main" className="glass-chip pointer-events-auto h-[52px] p-2">
      <FluidHover itemSelector="a[data-fluid]" axis="x" className="nav-cluster flex h-full items-center gap-2">
        {(blog ? ENTRIES.map((e) => (typeof e !== "string" && e.href === "/#map" ? { href: "/blog", label: "Blog", match: "/blog" } : e)) : ENTRIES).map((e) => {
          if (e === "dot-start" || e === "dot-end") {
            return <span key={e} aria-hidden="true" className={`nav-dot ${e === "dot-start" ? "nav-dot-start" : "nav-dot-end"}`} />;
          }
          const active = !!e.match && (pathname === e.match || pathname.startsWith(`${e.match}/`));
          return (
            <Link
              key={e.href}
              data-fluid
              href={e.href}
              aria-current={active ? "page" : undefined}
              className={`nav-item${active ? " nav-item-active" : ""}`}
            >
              {e.label}
            </Link>
          );
        })}
      </FluidHover>
    </nav>
  );
}
