import Link from "next/link";
import { fmtDate } from "@/lib/data";
import type { TestMark } from "@/lib/test-mark";

// Marca neutra: "lo ejecutamos nosotros", no "es seguro". Sin check ni verde; un fallo se muestra igual de visible.
const base =
  "inline-flex items-center gap-1.5 rounded-md font-mono uppercase tracking-[0.12em] leading-5 text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

function Icon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
      <circle cx="6" cy="6" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="6" cy="6" r="1.75" fill="currentColor" />
    </svg>
  );
}

export function TestedChip({ mark, compact = false }: { mark: TestMark | null; compact?: boolean }) {
  if (!mark) return null;
  const date = fmtDate(mark.date);
  const label = mark.failed ? "Tested by us · did not pass" : "Tested by us";
  const tone = mark.failed ? "border border-destructive/60 hover:bg-destructive/10" : "border border-ink/30 hover:bg-ink/[0.06]";
  const size = compact ? "px-1.5 py-0 text-[0.625rem]" : "px-2 py-0.5 text-[0.6875rem]";
  return (
    <Link
      href="/methodology#evidence"
      title={`${label}, last run ${date}. This does not mean the server is safe. What the mark means.`}
      className={`${base} ${tone} ${size}`}
    >
      <Icon />
      <span>{label}</span>
      {!compact && <span className="text-foreground/70">· {date}</span>}
    </Link>
  );
}
