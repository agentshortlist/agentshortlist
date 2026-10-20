"use client";

import { SEARCH_OPEN_EVENT } from "@/components/search-dialog";

export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(SEARCH_OPEN_EVENT))}
      data-sfx="manual"
      aria-label="Search"
      aria-haspopup="dialog"
      aria-keyshortcuts="Meta+K Control+K"
      title="Search (Ctrl K or /)"
      className="icon-btn"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4-4" />
      </svg>
    </button>
  );
}
