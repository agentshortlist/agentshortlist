import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow, PillLink } from "@/components/ui-kit";
import { BEST_PAGES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page does not exist or has moved. Start again from the rankings, the verified cards or the config checker.",
};

// 404 propia: el valor por defecto de Next se ve en blanco sobre el tema oscuro y sin botones.
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center space-y-8 text-center">
      <Eyebrow>404</Eyebrow>
      <h1 className="display-2 fs-title">That page isn&apos;t here.</h1>
      <p className="prose-measure text-[15px] leading-[1.65] text-muted-foreground">
        The address may be mistyped, or the page may have moved. Pick up from one of these.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PillLink href="/">Back to home</PillLink>
        <PillLink href="/verified" variant="soft">Verified cards</PillLink>
        <PillLink href="/check" variant="soft">Config checker</PillLink>
        <PillLink href="/blog" variant="ghost">Blog</PillLink>
      </div>
      <nav aria-label="Rankings" className="space-y-3 pt-4">
        <p className="eyebrow">Or browse a ranking</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-foreground/80">
          {BEST_PAGES.slice(0, 6).map((b) => (
            <li key={b.slug}>
              <Link href={`/best/${b.slug}`} className="underline-offset-4 transition-colors hover:text-foreground hover:underline">{b.h1}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
