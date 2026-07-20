"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function DayNightToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("day") : t("night")}
      className="relative flex h-9 w-16 items-center rounded-full border px-1"
      style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}
    >
      <motion.span
        className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        {mounted ? (isDark ? "🌙" : "☀️") : null}
      </motion.span>
    </button>
  );
}
