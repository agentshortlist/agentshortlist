import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/json-ld";
import { BrandMark } from "@/components/brand-mark";
import { ContextTip } from "@/components/context-tip";
import { CursorRibbon } from "@/components/cursor-ribbon";
import { FluidHover } from "@/components/fluid-hover";
import { SiteNavCluster } from "@/components/site-nav-cluster";
import { SiteTicker } from "@/components/site-ticker";
import { IntroScreen } from "@/components/intro-screen";
import { MobileMenu } from "@/components/mobile-menu";
import { NewsletterForm } from "@/components/newsletter-form";
import { PrivacyNotice, PrivacySettingsButton } from "@/components/privacy-notice";
import { SearchDialog } from "@/components/search-dialog";
import { SearchTrigger } from "@/components/search-trigger";
import { SoundProvider } from "@/components/sound-provider";
import { SoundToggle } from "@/components/sound-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Eyebrow } from "@/components/ui-kit";
import { BEST_PAGES, CATEGORIES, fmtDate, getAgents } from "@/lib/data";
import { snapshotCount } from "@/lib/history";
import { CORRECTIONS_EMAIL, GA_ID, SITE_NAME, SITE_TAGLINE, SITE_URL, X_URL, LINKEDIN_URL, BLUESKY_URL, GITHUB_URL, GITHUB_ORG_URL } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: Best AI Agents, Ranked by Real Signals`, template: `%s | ${SITE_NAME}` },
  description: SITE_TAGLINE,
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Fijo: las páginas que se regeneran en el servidor (inicio, rankings) no ven src/content y perdían el enlace al blog.
  const hasBlog = true;
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${geistSans.variable} ${plexMono.variable}`}>
      <head>
        {/* Aplica el tema elegido antes de pintar para evitar el parpadeo. Por defecto: oscuro. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var l=localStorage.getItem('agentshortlist:theme')==='light',c=document.documentElement;c.classList.toggle('light',l);c.classList.toggle('dark',!l);c.style.colorScheme=l?'light':'dark'}catch(e){}" +
              "try{var d=document.documentElement;if(location.pathname==='/'&&(/[?&]intro=1/.test(location.search)||(!sessionStorage.getItem('agentshortlist:intro')&&!navigator.webdriver&&!matchMedia('(prefers-reduced-motion: reduce)').matches))){d.classList.add('intro');setTimeout(function(){d.classList.remove('intro')},6000)}}catch(e){}",
          }}
        />
        {/* Google Analytics en modo de consentimiento: todo denegado por defecto (sin cookies). Solo pasa a "granted" si el lector acepta. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}" +
              "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});" +
              "gtag('set','ads_data_redaction',true);" +
              "try{if(localStorage.getItem('agentshortlist:analytics')==='granted'&&navigator.globalPrivacyControl!==true){gtag('consent','update',{analytics_storage:'granted'})}}catch(e){}" +
              `gtag('js',new Date());gtag('config','${GA_ID}',{allow_google_signals:false,allow_ad_personalization_signals:false});` +
              // El script de Google pesa unos 180 KB: se descarga cuando la página ya ha cargado (o ante la primera interacción), no antes de pintar.
              // Los datos que se encolan antes (consentimiento y configuración) no se pierden: gtag.js los procesa al llegar.
              `var gl=function(){if(gl.d)return;gl.d=1;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(s)};` +
              "['pointerdown','keydown','scroll','touchstart'].forEach(function(e){addEventListener(e,gl,{once:true,passive:true})});" +
              "addEventListener('load',function(){(window.requestIdleCallback||function(f){setTimeout(f,1200)})(gl,{timeout:3000})});",
          }}
        />
      </head>
      <body className="min-h-dvh bg-background pb-9 text-foreground antialiased">
        <a href="#main" className="skip-link">Skip to content</a>
        <IntroScreen tools={getAgents().length} rankings={BEST_PAGES.length} />
        <PrivacyNotice />
        <ContextTip />
        <CursorRibbon />
        <SoundProvider />
        <SearchDialog />
        <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute size-0 overflow-hidden">
          <filter id="nav-liquid-filter" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="2" seed="3" stitchTiles="stitch" result="turbulence" />
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="24" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_TAGLINE,
            inLanguage: "en",
            publisher: { "@id": `${SITE_URL}/#organization` },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/apple-icon`,
            description: SITE_TAGLINE,
            sameAs: [X_URL, LINKEDIN_URL, BLUESKY_URL, GITHUB_ORG_URL],
            contactPoint: { "@type": "ContactPoint", contactType: "editorial corrections", email: CORRECTIONS_EMAIL, availableLanguage: "English" },
          }}
        />

        <div id="app-shell">
        <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-12">
          <div className="relative flex items-center justify-between gap-3">
            <Link
              href="/"
              aria-label={`${SITE_NAME} home`}
              className="glass-chip pointer-events-auto flex h-[52px] items-center gap-2.5 px-4 text-[0.9375rem] font-medium tracking-[-0.02em] outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ring pr-[18px]"
            >
              <BrandMark />
              <span>{SITE_NAME}</span>
            </Link>
            <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[52px] items-center justify-center min-[1280px]:flex">
              <SiteNavCluster blog={hasBlog} />
            </div>
            <div className="glass-chip pointer-events-auto flex h-[52px] items-center gap-0.5 p-2 text-sm">
              <nav aria-label="Main" className="min-[1280px]:hidden">
                <FluidHover itemSelector="a[data-fluid]" className="flex items-center gap-0.5">
                  <Link data-fluid href="/best/coding" className="hidden rounded-full px-3 py-1.5 text-foreground/75 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none min-[560px]:block">
                    Rankings
                  </Link>
                  <Link data-fluid href="/categories/mcp-servers" className="hidden rounded-full px-3 py-1.5 text-foreground/75 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none md:block">
                    Categories
                  </Link>
                  <Link data-fluid href="/methodology" className="hidden rounded-full px-3 py-1.5 text-foreground/75 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none md:block">
                    Methodology
                  </Link>
                  <Link data-fluid href="/check" className="hidden rounded-full px-3 py-1.5 text-foreground/75 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none min-[1000px]:block">
                    Config checker
                  </Link>
                </FluidHover>
              </nav>
              <MobileMenu
                main={[
                  { href: "/check", label: "Config checker" },
                  { href: "/verified", label: "Verified cards" },
                  { href: "/pick", label: "Pick a server" },
                  { href: "/compare/live", label: "Compare servers" },
                  ...(hasBlog ? [{ href: "/blog", label: "Blog" }] : []),
                  { href: "/best/coding", label: "Rankings" },
                  { href: "/categories/coding-agents", label: "Categories" },
                  { href: "/compare", label: "Head-to-head" },
                  { href: "/#map", label: "Map" },
                  { href: "/methodology", label: "Methodology" },
                  { href: "/coverage", label: "Coverage" },
                  ...(snapshotCount >= 2 ? [{ href: "/changes", label: "Changes" }] : []),
                  { href: "/#faq", label: "FAQ" },
                ]}
                rankings={BEST_PAGES.map((b) => ({ href: `/best/${b.slug}`, label: b.h1.replace(/^Best /, "") }))}
                more={[
                  { href: "/about", label: "About" },
                  { href: "/sponsor", label: "Sponsor" },
                  { href: "/privacy", label: "Privacy" },
                ]}
              />
              <SearchTrigger />
              <span className="hidden items-center min-[768px]:flex"><ThemeToggle /></span>
              <span className="hidden items-center min-[768px]:flex"><SoundToggle /></span>
              <Link
                href="#newsletter"
                className="edge-btn edge-primary hdr-subscribe ml-1 flex h-9 items-center rounded-full px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-[85rem] px-4 pt-28 sm:px-6 sm:pt-[152px] lg:px-12">
          {children}
        </main>

        <footer className="hairline-top">
          <div id="newsletter" className="mx-auto max-w-[85rem] scroll-mt-24 px-4 pb-6 pt-14 sm:px-6 lg:px-12">
            <div className="surface-lg grid gap-8 p-6 sm:p-10 md:grid-cols-2 md:items-center">
              <div className="space-y-3">
                <Eyebrow>Newsletter</Eyebrow>
                <h2 className="display-2 text-3xl sm:text-4xl">The MCP Risk Radar, in your inbox.</h2>
                <p className="prose-measure text-muted-foreground">
                  A short note when something changes: new advisories on the MCP servers we have read, projects that go quiet, and ranking changes. Confirm by email, unsubscribe any time.
                </p>
              </div>
              <NewsletterForm compact />
            </div>
          </div>

          <div className="mx-auto grid max-w-[85rem] gap-10 px-4 py-12 text-sm sm:grid-cols-3 sm:px-6 lg:px-12">
            <div className="space-y-3">
              <Eyebrow>{SITE_NAME}</Eyebrow>
              <p className="prose-measure text-muted-foreground">
                Strictly curated. Figures come from the public GitHub API and were last checked {fmtDate(getAgents().map((a) => a.verifiedAt).sort().at(-1) ?? null)}.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <a
                  href={X_URL}
                  target="_blank"
                  rel="nofollow noopener noreferrer me"
                  aria-label={`${SITE_NAME} on X (opens in a new tab)`}
                  className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>@agentshortlist</span>
                </a>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="nofollow noopener noreferrer me"
                  aria-label={`${SITE_NAME} on LinkedIn (opens in a new tab)`}
                  className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground"
                >
                  LinkedIn
                </a>
                <a
                  href={BLUESKY_URL}
                  target="_blank"
                  rel="nofollow noopener noreferrer me"
                  aria-label={`${SITE_NAME} on Bluesky (opens in a new tab)`}
                  className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground"
                >
                  Bluesky
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={`${SITE_NAME} on GitHub (opens in a new tab)`}
                  className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <Eyebrow>Rankings</Eyebrow>
              <ul className="space-y-2 text-foreground/80">
                {BEST_PAGES.slice(0, 6).map((b) => (
                  <li key={b.slug}>
                    <Link href={`/best/${b.slug}`} className="transition-colors hover:text-foreground">{b.h1}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <Eyebrow>Browse</Eyebrow>
              <ul className="space-y-2 text-foreground/80">
                {CATEGORIES.slice(0, 5).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/categories/${c.slug}`} className="transition-colors hover:text-foreground">{c.name}</Link>
                  </li>
                ))}
                <li><Link href="/methodology" className="transition-colors hover:text-foreground">Methodology</Link></li>
                <li><Link href="/compare" className="transition-colors hover:text-foreground">Compare</Link></li>
                <li><Link href="/verified" className="transition-colors hover:text-foreground">Verified cards</Link></li>
                <li><Link href="/pick" className="transition-colors hover:text-foreground">Pick a server</Link></li>
                <li><Link href="/check" className="transition-colors hover:text-foreground">Config checker</Link></li>
                {hasBlog && <li><Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link></li>}
                <li><Link href="/coverage" className="transition-colors hover:text-foreground">Coverage</Link></li>
                <li><Link href="/changes" className="transition-colors hover:text-foreground">Changes</Link></li>
                <li><Link href="/about" className="transition-colors hover:text-foreground">About</Link></li>
                <li><Link href="/sponsor" className="transition-colors hover:text-foreground">Sponsor</Link></li>
                <li><Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link></li>
                <li><PrivacySettingsButton /></li>
              </ul>
            </div>
          </div>
        </footer>
        <SiteTicker />
        </div>
      </body>
    </html>
  );
}
