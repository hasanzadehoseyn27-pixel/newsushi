"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

const LABEL: Record<string, string> = { fa: "فا", en: "EN", ja: "日" };

export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const activeLocale = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-full border p-1" style={{ borderColor: "var(--line)" }}>
      {routing.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => router.replace(pathname as "/", { locale })}
          className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
          style={{
            background: activeLocale === locale ? "var(--accent)" : "transparent",
            color: activeLocale === locale ? "var(--accent-ink)" : "var(--ink-soft)",
          }}
        >
          {LABEL[locale]}
        </button>
      ))}
    </div>
  );
}
