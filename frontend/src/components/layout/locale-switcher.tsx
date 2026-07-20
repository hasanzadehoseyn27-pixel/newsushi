"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { LocaleFlag } from "@/components/layout/flag-icons";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const activeLocale = useLocale();

  return (
    <div className="flex items-center gap-1.5 rounded-full border px-1.5 py-1" style={{ borderColor: "var(--line)" }}>
      {routing.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => router.replace(pathname as "/", { locale })}
          aria-label={locale}
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-transform hover:scale-110"
          style={{
            outline: activeLocale === locale ? "2px solid var(--accent)" : "1px solid var(--line)",
            outlineOffset: 1,
          }}
        >
          <LocaleFlag locale={locale} className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}
