"use client";

import { useEffect, useState } from "react";
import { playSound, unlockSound } from "@/lib/sfx";

const KEY = "agentshortlist:theme";

// Claro u oscuro, a elección del lector. Se guarda y se aplica antes de pintar (script del <head>).
export function ThemeToggle() {
  const [light, setLight] = useState(true);
  useEffect(() => {
    // La elección guardada manda. Si React vuelve a pintar la raíz (p. ej. tras un fallo de hidratación) puede devolver la clase
    // "dark" del servidor, así que se reaplica al montar, al volver desde la caché del navegador y cuando cambia en otra pestaña.
    const sync = () => {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(KEY);
      } catch {}
      const root = document.documentElement;
      const wantLight = stored !== "dark"; // claro por defecto; solo el oscuro se guarda como elección
      if (root.classList.contains("light") !== wantLight || root.classList.contains("dark") === wantLight) {
        root.classList.toggle("light", wantLight);
        root.classList.toggle("dark", !wantLight);
        root.style.colorScheme = wantLight ? "light" : "dark";
      }
      setLight(wantLight);
    };
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) sync();
    };
    window.addEventListener("pageshow", sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("pageshow", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function toggle() {
    unlockSound();
    const next = !light;
    const root = document.documentElement;
    root.classList.add("theme-instant");
    root.classList.toggle("light", next);
    root.classList.toggle("dark", !next);
    root.style.colorScheme = next ? "light" : "dark";
    try {
      window.localStorage.setItem(KEY, next ? "light" : "dark");
    } catch {}
    // Se quita tras forzar el repintado, en el siguiente fotograma.
    void root.offsetHeight;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => root.classList.remove("theme-instant")));
    setLight(next);
    playSound(next ? "toggle-on" : "toggle-off");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      data-sfx="manual"
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      title={light ? "Dark theme" : "Light theme"}
      suppressHydrationWarning
      className="icon-btn"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {light ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
