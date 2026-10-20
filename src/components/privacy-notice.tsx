"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GA_ID } from "@/lib/site";

const KEY = "agentshortlist:analytics"; // "granted" | "denied"
const OPEN_EVENT = "agentshortlist-open-consent";

// La etiqueta de Google Analytics está en el <head> en modo de consentimiento: todo denegado y sin cookies hasta que el lector acepta.
// Aquí solo se actualiza ese consentimiento. Con Global Privacy Control activo se trata como un rechazo y no se pregunta.
type Gtag = (...a: unknown[]) => void;
const gtag = (...a: unknown[]) => {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  if (g) g(...a);
};

function grantAnalytics() {
  gtag("consent", "update", { analytics_storage: "granted" });
}

function stopAnalytics() {
  gtag("consent", "update", { analytics_storage: "denied" });
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_")) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${location.hostname.replace(/^www\./, "")}`;
    }
  }
}

const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export function PrivacyNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    const saved = read();
    // Si ya decidió (o el navegador lo decide con GPC), solo se vuelve a preguntar desde "Privacy settings".
    if (saved !== null || gpc) return;
    if (document.documentElement.classList.contains("intro")) {
      const open = () => window.setTimeout(() => setShow(true), 600);
      window.addEventListener("agentshortlist-intro-done", open, { once: true });
      return () => window.removeEventListener("agentshortlist-intro-done", open);
    }
    const id = window.setTimeout(() => setShow(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const reopen = () => setShow(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const choose = (v: "granted" | "denied") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    if (v === "granted") {
      (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = false;
      grantAnalytics();
    } else stopAnalytics();
    setShow(false);
  };

  if (!show) return null;
  return (
    <aside className="privacy-notice" role="region" aria-label="Privacy and analytics">
      <p className="text-sm leading-[1.5] text-foreground/85">
        We would like to count visits with Google Analytics. Cookies and visitor identifiers only start if you accept. No ads either way. Theme and sound
        choices stay in your browser.{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy details</Link>
      </p>
      <div className="privacy-actions">
        <button
          type="button"
          className="edge-btn edge-soft h-9 shrink-0 rounded-full px-5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => choose("denied")}
        >
          Decline
        </button>
        <button
          type="button"
          className="edge-btn edge-primary h-9 shrink-0 rounded-full px-5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => choose("granted")}
        >
          Accept
        </button>
      </div>
    </aside>
  );
}

export function PrivacySettingsButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className="transition-colors hover:text-foreground">
      Privacy settings
    </button>
  );
}
