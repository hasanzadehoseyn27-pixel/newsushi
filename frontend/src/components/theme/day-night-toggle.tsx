"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function DayNightToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("day") : t("night")}
      className="flex h-9 w-16 shrink-0 items-center rounded-full border p-1"
      style={{
        borderColor: "var(--line)",
        background: "var(--surface-2)",
        justifyContent: isDark ? "flex-end" : "flex-start",
      }}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        {mounted ? (isDark ? "🌙" : "☀️") : null}
      </motion.span>
    </button>
  );
}
