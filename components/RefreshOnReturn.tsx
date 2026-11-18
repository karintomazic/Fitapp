"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function RefreshOnReturn({ version }: { version: string }) {
  const router = useRouter();
  const startVersion = useRef(version);

  useEffect(() => {
    async function onVisible() {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { version: live } = await res.json();
        if (live !== startVersion.current) {
          window.location.reload();
          return;
        }
      } catch {
        // offline, or logged out: just try to refresh the data below
      }
      router.refresh();
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);

  return null;
}
