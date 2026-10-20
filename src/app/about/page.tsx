import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { AUTHOR_BIO, AUTHOR_NAME, CORRECTIONS_EMAIL, BLUESKY_URL, GITHUB_URL, GITHUB_ORG_URL, LINKEDIN_URL, SITE_NAME, X_URL, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Who writes AgentShortlist, how the verified cards are made, and how to send a correction. One person, a source for every line.",
  alternates: { canonical: "/about" },
};

const h2 = "display-2 pt-4 text-xl sm:text-2xl";
const link = "underline underline-offset-4 hover:text-foreground";

export default function AboutPage() {
  return (
    <article className="max-w-3xl space-y-5 [&_p]:text-foreground/85 [&_li]:text-foreground/85">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `About ${SITE_NAME}`,
          url: absoluteUrl("/about"),
          mainEntity: {
            "@type": "Person",
            name: AUTHOR_NAME,
            description: AUTHOR_BIO,
            jobTitle: "Senior software developer and SEO",
            worksFor: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/"), sameAs: [X_URL, LINKEDIN_URL, BLUESKY_URL, GITHUB_ORG_URL] },
          },
        }}
      />
      <JsonLd data={breadcrumbLd([{ name: "Home", url: absoluteUrl("/") }, { name: "About", url: absoluteUrl("/about") }])} />
      <p className="eyebrow">Who is behind this</p>
      <h1 className="display-2 fs-title">About {SITE_NAME}</h1>
      <p className="text-[17px] leading-[1.6]">
        {SITE_NAME} writes down what MCP servers can do, with a source for every line, so you can check before you install one.
      </p>

      <h2 className={h2}>The author</h2>
      <p>{AUTHOR_BIO}</p>
      <p>
        {SITE_NAME} is a one-person project. I read the documentation and source of each server myself, and I write the cards and the
        articles. You can find the project on <a href={X_URL} className={link} rel="me noopener noreferrer" target="_blank">X</a>,{" "}
        <a href={BLUESKY_URL} className={link} rel="me noopener noreferrer" target="_blank">Bluesky</a> and{" "}
        <a href={LINKEDIN_URL} className={link} rel="me noopener noreferrer" target="_blank">LinkedIn</a>.
        The code is open source on <a href={GITHUB_URL} className={link} rel="me noopener noreferrer" target="_blank">GitHub</a>: MIT for the code, CC BY 4.0 for the
        cards and the data, so you can reuse them if you credit the source.
      </p>

      <h2 className={h2}>What you will find here</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <Link href="/verified" className={link}>Verified cards</Link>: what a server can change, what it sends out, how it is maintained and how to
          limit it. Each line links to the documentation or source it comes from.
        </li>
        <li>
          Security advisories from <a href="https://osv.dev" className={link} rel="noopener noreferrer" target="_blank">OSV.dev</a>, matched to the package
          after checking that it belongs to the project. They are refreshed every day.
        </li>
        <li>
          The <Link href="/check" className={link}>config checker</Link>, which runs in your browser and sends nothing anywhere.
        </li>
        <li>
          <Link href="/best/coding" className={link}>Rankings</Link> of open-source AI agents built from public GitHub signals. The score is a discovery aid,
          not a quality rating; the <Link href="/methodology" className={link}>method is public</Link>.
        </li>
        <li>
          The <Link href="/blog" className={link}>blog</Link>, where the findings are written up with their tables and sources.
        </li>
      </ul>

      <h2 className={h2}>What this is not</h2>
      <p>
        Nothing here is a security audit. A card says what the documentation and source said on the date shown; projects change, so check the linked
        source before you rely on a line. If something is missing from a card, we write that we could not verify it instead of guessing.
      </p>

      <h2 className={h2}>Corrections</h2>
      <p>
        If a line is wrong or out of date, send the primary source to{" "}
        <a href={`mailto:${CORRECTIONS_EMAIL}`} className={link}>{CORRECTIONS_EMAIL}</a> and I will fix it and note the change. Questions about
        sponsorship are on the <Link href="/sponsor" className={link}>sponsor page</Link>; how we handle your data is on the{" "}
        <Link href="/privacy" className={link}>privacy page</Link>.
      </p>
    </article>
  );
}
