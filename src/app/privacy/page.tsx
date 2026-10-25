import type { Metadata } from "next";
import { CORRECTIONS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What AgentShortlist stores, who processes it, how long it is kept and how to use your rights. Analytics only if you accept, no ads, no tracking without consent.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "2026-10-19";
const h2 = "display-2 pt-4 text-xl sm:text-2xl";

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl space-y-5 [&_p]:text-foreground/85 [&_li]:text-foreground/85">
      <p className="eyebrow">Your data</p>
      <h1 className="display-2 fs-title">Privacy</h1>
      <p className="text-[15px] leading-[1.65] text-muted-foreground">
        Short version: no advertising. Google Analytics sets cookies and identifies visits only if you accept; until then it runs in a restricted mode. We keep your email only if you subscribe to the newsletter.
        Last updated <time dateTime={UPDATED}>{UPDATED}</time>.
      </p>

      <h2 className="display-2 pt-4 text-xl sm:text-2xl">What we collect</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Newsletter:</strong> your email address, only if you subscribe, and whether you have confirmed or unsubscribed.
        </li>
        <li>
          <strong>Server logs:</strong> like every website, our server records technical details of each request (IP address,
          browser, page and time) to keep the site secure and working. We do not use them to profile visitors.
        </li>
        <li>
          <strong>Sponsorships (not live yet):</strong> if you buy a placement, the payment provider handles your payment details
          and we keep only the order details we need to deliver it.
        </li>
        <li>
          <strong>Visit statistics (only if you accept):</strong> Google Analytics 4 records which pages are viewed, approximate location
          (country and city), device, browser and how you arrived. We switch off Google signals and ad personalization. It also counts how the tools are used (for example, a configuration
          check or a newsletter signup, and from which page) without ever including what you type or paste, such as a configuration or an email address. Until you
          press Accept it runs in a restricted mode (see below).
        </li>
        <li>We do not ask for names and we do not use advertising trackers.</li>
      </ul>

      <h2 className={h2}>What we store in your browser</h2>
      <p>
        Without your consent we set no cookies. We use your browser&apos;s local storage for choices you make or things you have already
        seen, and this information never leaves your device:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li><code>agentshortlist:theme</code>: light or dark mode.</li>
        <li><code>agentshortlist:sound</code>: whether click sounds are on.</li>
        <li><code>agentshortlist:analytics</code>: your choice about analytics (accepted or declined).</li>
        <li><code>agentshortlist:intro</code> (session only): that you already saw the opening screen.</li>
      </ul>
      <p>Because these are preferences you ask for, they do not need consent. You can clear them any time in your browser settings.</p>

      <h2 className={h2}>Analytics and cookies</h2>
      <p>
        The Google Analytics tag is on every page, with consent denied by default. Until you choose, and if you press Decline or your browser
        sends the Global Privacy Control signal, it sets no cookies and no visitor identifiers. Even so, Google receives that a page was viewed
        together with technical data your browser sends with any request, such as your IP address and browser details, and uses it only for
        aggregate, modeled statistics. If you press Accept, it also sets the cookies <code>_ga</code> and <code>_ga_*</code> to tell visits
        apart. Google may process this data outside the European Economic Area. You can change your mind at any time with &quot;Privacy
        settings&quot; in the footer: declining stops the cookies and removes the analytics cookies from this site. The legal basis for the
        cookies and identifiers is your consent.
      </p>

      <h2 className={h2}>How subscription works</h2>
      <p>
        After you submit your email we send one confirmation message. You are subscribed only after you press the confirmation
        button in it. If you never confirm, we send you nothing else. The legal basis is your consent, and you can withdraw it at
        any time with the unsubscribe link in every email.
      </p>

      <h2 className={h2}>Who processes your data</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Resend (EU region, Ireland) stores the newsletter address and sends our emails.</li>
        <li>Google (Google Analytics) processes the visit statistics, only if you accept.</li>
        <li>
          Our hosting provider runs the server and keeps the technical logs mentioned above for a limited time. The sender IP is
          also used to rate-limit the signup form: it stays in server memory for a few minutes and is not written to a database.
        </li>
        <li>Stripe will process payments if paid sponsorships go live. Its role will be added here before that happens.</li>
        <li>The project data on the rankings (stars, license, dates) is public GitHub data about software, not about people.</li>
      </ul>
      <p>We do not sell your data and we do not share it for advertising.</p>

      <h2 className={h2}>How long we keep it</h2>
      <p>
        Newsletter address: until you unsubscribe and ask us to delete it, or until the newsletter stops. An address that never
        confirms is not used for anything else. Server logs: for a limited period set by the hosting provider.
      </p>

      <h2 className={h2}>Your rights</h2>
      <p>
        You can ask us to show, correct or delete your data, to restrict or object to its use, and to withdraw your consent. Write to{" "}
        <a href={`mailto:${CORRECTIONS_EMAIL}`} className="underline underline-offset-4 hover:text-foreground">{CORRECTIONS_EMAIL}</a>.
        If you think we handled your data badly, you can also complain to your local data protection authority.
      </p>
    </article>
  );
}
