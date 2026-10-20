import Link from "next/link";
import type { ReactNode } from "react";

// Markdown mínimo para el blog, sin dependencias: títulos ##/###, párrafos, listas, citas, tablas, bloques de código,
// **negrita**, `código`, [enlaces](url) e imágenes ![texto](/ruta.png "1200x630") en su propia línea
// (el texto alternativo se muestra como pie; el tamaño es opcional pero evita saltos de diseño). Todo se escapa como texto de React; no se admite HTML.
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function inline(text: string, key = ""): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean).map((part, i) => {
    const k = `${key}${i}`;
    if (part.startsWith("`")) return <code key={k} className="mono-num rounded bg-ink/[0.07] px-1.5 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>;
    if (part.startsWith("**")) return <strong key={k} className="font-medium text-foreground">{part.slice(2, -2)}</strong>;
    const l = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (l) {
      const [, label, href] = l;
      return href.startsWith("/") || href.startsWith("#") ? (
        <Link key={k} href={href} className="underline underline-offset-4 hover:text-foreground">{label}</Link>
      ) : (
        <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">{label}</a>
      );
    }
    return part;
  });
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r/g, "").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let n = 0;
  const k = () => `b${n++}`;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      out.push(<pre key={k()} className="mono-num overflow-x-auto rounded-xl bg-ink/[0.06] p-4 text-[13px] leading-[1.6]"><code>{code.join("\n")}</code></pre>);
      continue;
    }
    const img = line.match(/^!\[([^\]]*)\]\(((?:\/|https:\/\/)[^\s)]+)(?:\s+"(\d+)x(\d+)")?\)\s*$/);
    if (img) {
      const [, alt, src, w, h] = img;
      out.push(
        <figure key={k()} className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} width={w ? Number(w) : undefined} height={h ? Number(h) : undefined} loading="lazy" decoding="async" className="h-auto w-full rounded-xl border border-ink/10" />
          {alt && <figcaption className="text-center text-sm text-muted-foreground">{alt}</figcaption>}
        </figure>,
      );
      i++;
      continue;
    }
    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      const text = h[2];
      out.push(
        h[1].length === 2 ? (
          <h2 key={k()} id={slug(text)} className="display-2 scroll-mt-28 pt-8 text-2xl sm:text-3xl">{inline(text)}</h2>
        ) : (
          <h3 key={k()} id={slug(text)} className="scroll-mt-28 pt-4 text-xl font-medium tracking-[-0.03em]">{inline(text)}</h3>
        ),
      );
      i++;
      continue;
    }
    if (line.startsWith(">")) {
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) q.push(lines[i++].replace(/^>\s?/, ""));
      out.push(<blockquote key={k()} className="border-l-2 border-ink/25 pl-4 text-foreground/80">{inline(q.join(" "))}</blockquote>);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/).test(lines[i])) items.push(lines[i++].replace(/^\s*(\d+\.|[-*])\s+/, ""));
      const Tag = ordered ? "ol" : "ul";
      out.push(
        <Tag key={k()} className={`${ordered ? "list-decimal" : "list-disc"} space-y-1.5 pl-5`}>
          {items.map((t, j) => <li key={j}>{inline(t, `l${j}`)}</li>)}
        </Tag>,
      );
      continue;
    }
    if (line.startsWith("|") && lines[i + 1]?.match(/^\|[\s:|-]+\|?$/)) {
      const cells = (l: string) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(cells(lines[i++]));
      out.push(
        <div key={k()} className="surface overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead><tr className="border-b border-ink/10">{head.map((c, j) => <th key={j} scope="col" className="px-3 py-2.5 font-medium">{inline(c, `h${j}`)}</th>)}</tr></thead>
            <tbody>{rows.map((r, a) => <tr key={a} className="border-b border-ink/10 last:border-0">{r.map((c, j) => <td key={j} className="px-3 py-2.5 align-top text-foreground/85">{inline(c, `c${a}${j}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    const p: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|```|!\[|>|\s*[-*]\s|\s*\d+\.\s|\|)/.test(lines[i])) p.push(lines[i++]);
    out.push(<p key={k()} className="leading-[1.7]">{inline(p.join(" "))}</p>);
  }
  return <div className="space-y-5 text-[16px] text-foreground/85">{out}</div>;
}
