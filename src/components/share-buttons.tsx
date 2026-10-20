import { CopyLinkButton } from "@/components/copy-link-button";

// Enlaces de compartir sin scripts ni cookies de terceros: cada botón abre la pantalla de compartir de la red.
// Así no se cargan widgets de redes sociales ni se envía nada antes de que el lector pulse.
export function ShareButtons({ url, title, label = "Share this article" }: { url: string; title: string; label?: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const targets = [
    { name: "X", href: `https://x.com/intent/post?text=${t}&url=${u}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "Reddit", href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
    { name: "Hacker News", href: `https://news.ycombinator.com/submitlink?u=${u}&t=${t}` },
    { name: "Bluesky", href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];
  const chip =
    "inline-flex min-h-9 items-center rounded-full border border-ink/20 px-3.5 py-1.5 text-sm text-foreground/85 transition-colors hover:bg-ink/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted-foreground">Share</span>
      {targets.map((x) => (
        <a key={x.name} href={x.href} target="_blank" rel="nofollow noopener noreferrer" aria-label={`Share on ${x.name} (opens in a new tab)`} className={chip}>
          {x.name}
        </a>
      ))}
      <a href={`mailto:?subject=${t}&body=${u}`} aria-label="Share by email" className={chip}>
        Email
      </a>
      <CopyLinkButton url={url} className={chip} />
    </nav>
  );
}
