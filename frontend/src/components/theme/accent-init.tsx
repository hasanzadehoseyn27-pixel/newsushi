"use client";

import { useEffect } from "react";
import { useAccentStore, type AccentTheme } from "@/lib/theme/accent-store";

/** Applies the server-known accent on first paint, then hands control to the store. */
export function AccentInit({ initialAccent }: { initialAccent: AccentTheme }) {
  const setAccent = useAccentStore((s) => s.setAccent);

  useEffect(() => {
    setAccent(initialAccent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
