"use client";

import { useEffect, useState } from "react";
import { SOUND_EVENT, isSoundEnabled, playSound, setSoundEnabled, unlockSound } from "@/lib/sfx";

export function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const sync = () => setOn(isSoundEnabled());
    sync();
    window.addEventListener(SOUND_EVENT, sync);
    return () => window.removeEventListener(SOUND_EVENT, sync);
  }, []);

  function toggle() {
    unlockSound();
    if (on) {
      playSound("toggle-off"); // el último sonido antes de silenciar
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      data-sfx="manual"
      aria-pressed={on}
      aria-label={on ? "Sound effects on. Turn off" : "Sound effects off. Turn on"}
      title={on ? "Sound on" : "Sound off"}
      className="icon-btn"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
        {on ? (
          <>
            <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
            <path d="M18.2 6.8a7.6 7.6 0 0 1 0 10.4" />
          </>
        ) : (
          <>
            <path d="m16 9.5 5 5" />
            <path d="m21 9.5-5 5" />
          </>
        )}
      </svg>
    </button>
  );
}
