"use client";

import { useState, useSyncExternalStore } from "react";

// Makes a random sync key in the visitor's browser. It's never sent anywhere,
// so not even this website knows it.
export function SyncKeyGenerator() {
  const [key, setKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    // 32 random bytes as 64 hex characters, far too long to guess
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    setKey(Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(""));
    setCopied(false);
  }

  async function copy() {
    if (!key) return;
    await navigator.clipboard.writeText(key);
    setCopied(true);
  }

  if (!key) {
    return (
      <button
        type="button"
        onClick={generate}
        className="glass-pill self-start px-5 py-3 text-sm font-semibold text-mint-ink"
      >
        Make my sync key
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <code className="rounded-2xl bg-glass-strong px-4 py-3 font-mono text-sm break-all">
        {key}
      </code>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="glass-pill px-4 py-2 text-sm font-semibold text-mint-ink"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={generate}
          className="text-sm font-semibold text-foreground/70 hover:underline"
        >
          Make a new one
        </button>
        {/* tells screen readers the copy worked */}
        <span role="status" className="sr-only">
          {copied ? "Sync key copied" : ""}
        </span>
      </div>
    </div>
  );
}

// The browser knows its own time zone, but the server doesn't, so this only
// shows up after the page loads (the server renders nothing here).
const noSubscribe = () => () => {};

export function TimeZoneHint() {
  const zone = useSyncExternalStore(
    noSubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => null,
  );
  if (!zone) return null;
  return (
    <>
      Yours looks like <code className="font-mono font-semibold">{zone}</code>.
    </>
  );
}
