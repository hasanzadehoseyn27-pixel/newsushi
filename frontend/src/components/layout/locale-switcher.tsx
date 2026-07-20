"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

const FLAG: Record<string, string> = { fa: "🇮🇷", en: "🇬🇧", ja: "🇯🇵" };

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
          aria-label={locale}
          className="cursor-pointer rounded-full px-2 py-1 text-base transition-transform hover:scale-110"
          style={{
            background: activeLocale === locale ? "var(--accent-soft)" : "transparent",
            outline: activeLocale === locale ? "1.5px solid var(--accent)" : "none",
          }}
        >
          {FLAG[locale]}
        </button>
      ))}
    </div>
  );
}
