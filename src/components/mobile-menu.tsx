"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SoundToggle } from "@/components/sound-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

type Item = { href: string; label: string };

// Menú de móvil (menos de 768 px): panel a pantalla completa con todas las secciones y los rankings.
// Se cierra con Esc, al tocar un enlace o al cambiar de página; bloquea el scroll de fondo mientras está abierto.
export function MobileMenu({ main, rankings, more }: { main: Item[]; rankings: Item[]; more: Item[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  const close = useCallback(() => {
    setOpen(false);
    openRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("menu-open");
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    // Si la ventana pasa a ser ancha (girar el móvil), el menú ya no tiene sentido.
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      root.classList.remove("menu-open");
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open, close]);

  const link = (i: Item, cls: string) => (
    <li key={i.href}>
      <Link href={i.href} className={cls} aria-current={pathname === i.href ? "page" : undefined} onClick={() => setOpen(false)}>
        {i.label}
      </Link>
    </li>
  );

  return (
    <>
      <button
        ref={openRef}
        type="button"
        className="icon-btn mobile-menu-btn"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M4 8h16M4 16h16" />
        </svg>
      </button>
      {mounted &&
        createPortal(
          <div id="mobile-menu" className={`mobile-menu${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Site menu" hidden={!open}>
            <div className="mobile-menu-top">
              <span className="text-[0.9375rem] font-medium tracking-[-0.02em]">AgentShortlist</span>
              <button ref={closeRef} type="button" className="icon-btn" aria-label="Close menu" onClick={close}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav aria-label="Mobile" className="mobile-menu-body">
              <ul className="space-y-1">{main.map((i) => link(i, "mobile-menu-link"))}</ul>
              <p className="mobile-menu-label">Rankings</p>
              <ul className="space-y-0.5">{rankings.map((i) => link(i, "mobile-menu-sub"))}</ul>
              <ul className="mobile-menu-more">
                {more.map((i) => link(i, "mobile-menu-sub"))}
                <li>
                  <a href="https://x.com/agentshortlist" target="_blank" rel="nofollow noopener noreferrer me" aria-label="X (opens in a new tab)" className="mobile-menu-sub mobile-menu-icon">
                    <span className="inline-flex items-center">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </span>
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/agentshortlist/" target="_blank" rel="nofollow noopener noreferrer me" aria-label="LinkedIn (opens in a new tab)" className="mobile-menu-sub mobile-menu-icon">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://bsky.app/profile/agentshortlist.dev" target="_blank" rel="nofollow noopener noreferrer me" aria-label="Bluesky (opens in a new tab)" className="mobile-menu-sub mobile-menu-icon">
                    Bluesky
                  </a>
                </li>
                <li>
                  <a href="https://github.com/agentshortlist/agentshortlist" target="_blank" rel="noopener noreferrer me" aria-label="GitHub (opens in a new tab)" className="mobile-menu-sub mobile-menu-icon">
                    GitHub
                  </a>
                </li>
              </ul>
              <Link href="/#newsletter" className="edge-btn edge-primary mobile-menu-cta" onClick={() => setOpen(false)}>
                Subscribe to the newsletter
              </Link>
            </nav>
            <div className="mobile-menu-foot">
              <span className="text-xs text-muted-foreground">Display and sound</span>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <SoundToggle />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
