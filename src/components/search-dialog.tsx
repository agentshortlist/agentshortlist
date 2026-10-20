"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playSound, unlockSound } from "@/lib/sfx";

type Entry = { k: string; t: string; d: string; h: string; w: string };
export const SEARCH_OPEN_EVENT = "agentshortlist-search-open";

const TYPE_ORDER: Record<string, number> = { Tool: 0, Ranking: 1, Compare: 2, Category: 3, Page: 4 };
const SUGGESTED = ["Best AI Agents for Coding", "Best MCP Servers for Developers", "Methodology", "Coverage", "Compare"];

let cache: Entry[] | null = null;
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function search(entries: Entry[], q: string): Entry[] {
  const query = norm(q.trim());
  if (!query) return SUGGESTED.map((t) => entries.find((e) => e.t === t)).filter((e): e is Entry => !!e);
  const tokens = query.split(/\s+/).filter(Boolean);
  const scored: { e: Entry; s: number }[] = [];
  for (const e of entries) {
    const title = norm(e.t);
    const hay = `${title} ${norm(e.w)} ${norm(e.d)}`;
    if (!tokens.every((t) => hay.includes(t))) continue;
    let s = 10;
    if (title === query) s = 100;
    else if (title.startsWith(query)) s = 90;
    else if (title.includes(query)) s = 70;
    else if (tokens.every((t) => title.includes(t))) s = 55;
    scored.push({ e, s: s - (TYPE_ORDER[e.k] ?? 5) * 0.5 });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, 12).map((x) => x.e);
}

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [entries, setEntries] = useState<Entry[]>(cache ?? []);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const results = useMemo(() => search(entries, q), [entries, q]);

  const close = useCallback((sound = true) => {
    setOpen(false);
    if (sound) playSound("close");
    opener.current?.focus?.();
  }, []);

  const openIt = useCallback(() => {
    unlockSound();
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQ("");
    setActive(0);
    setOpen(true);
    playSound("open");
  }, []);

  // Atajos: Ctrl/Cmd+K abre o cierra; "/" abre si no se está escribiendo; el botón de la barra dispara el evento.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable='true']");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else openIt();
      } else if (e.key === "/" && !typing && !open && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openIt();
      }
    };
    const onOpen = () => openIt();
    window.addEventListener("keydown", onKey);
    window.addEventListener(SEARCH_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(SEARCH_OPEN_EVENT, onOpen);
    };
  }, [open, close, openIt]);

  // Al abrir: carga el índice una vez, bloquea el fondo (inert + sin scroll) y enfoca el campo.
  useEffect(() => {
    if (!open) return;
    const shell = document.getElementById("app-shell");
    shell?.setAttribute("inert", "");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();
    if (!cache) {
      fetch("/search-index.json")
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("index"))))
        .then((d: Entry[]) => {
          cache = d;
          setEntries(d);
        })
        .catch(() => setFailed(true));
    }
    return () => {
      shell?.removeAttribute("inert");
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (e: Entry) => {
    playSound("select");
    setOpen(false);
    router.push(e.h);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) go(r);
    } else if (e.key === "Tab") {
      e.preventDefault(); // el foco se queda en el campo; se navega con las flechas
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[10vh] sm:px-4" data-sfx="manual">
      <div className="absolute inset-0 bg-paper/70 backdrop-blur-md" onClick={() => close()} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Search" className="surface-lg relative flex max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden border border-ink/10 shadow-2xl" onKeyDown={onKeyDown}>
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-3 rounded-full bg-ink/[0.06] px-4 focus-within:bg-ink/[0.09] focus-within:ring-2 focus-within:ring-ring">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-ink/60">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              role="combobox"
              aria-expanded="true"
              aria-controls="search-results"
              aria-activedescendant={results[active] ? `search-opt-${active}` : undefined}
              aria-label="Search tools, rankings, comparisons and pages"
              autoComplete="off"
              spellCheck={false}
              placeholder="Search tools, rankings, comparisons"
              className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden shrink-0 rounded-md border border-ink/15 px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground sm:block">esc</kbd>
          </div>
        </div>
        <ul id="search-results" ref={list} role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {failed && entries.length === 0 && <li className="px-4 py-6 text-sm text-muted-foreground">The search index could not be loaded. Try again in a moment.</li>}
          {!failed && entries.length === 0 && <li className="px-4 py-6 text-sm text-muted-foreground">Loading...</li>}
          {entries.length > 0 && results.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted-foreground">No results for &ldquo;{q}&rdquo;. Try a tool name, a category or a word like &ldquo;license&rdquo;.</li>
          )}
          {!q.trim() && results.length > 0 && <li role="presentation" className="px-4 pb-1 pt-2 eyebrow">Suggested</li>}
          {results.map((r, i) => (
            <li key={r.h} role="option" id={`search-opt-${i}`} data-i={i} aria-selected={i === active}>
              <a
                href={r.h}
                tabIndex={-1}
                onMouseMove={() => active !== i && setActive(i)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                  e.preventDefault();
                  go(r);
                }}
                className={`flex items-start justify-between gap-4 rounded-xl px-4 py-3 transition-colors ${i === active ? "bg-ink/[0.08]" : ""}`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium tracking-[-0.02em]">{r.t}</span>
                  {r.d && <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{r.d}</span>}
                </span>
                <span className="mt-0.5 shrink-0 rounded-md border border-ink/15 px-2 py-0.5 font-mono text-[0.6875rem] uppercase leading-5 tracking-[0.12em] text-muted-foreground">{r.k}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-4 border-t border-ink/[0.09] px-4 py-2.5 font-mono text-[0.6875rem] text-muted-foreground">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span className="hidden sm:inline">Press / or Ctrl K anywhere</span>
        </div>
      </div>
    </div>
  );
}
