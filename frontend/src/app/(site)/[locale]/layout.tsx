import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { DayNightProvider } from "@/components/theme/day-night-provider";
import { AccentInit } from "@/components/theme/accent-init";
import { getAccentTheme } from "@/lib/api";
import "../../globals.css";

// Self-hosted (no runtime call to Google Fonts — faster, more private, works offline).
// Shippori Mincho is subset to only the Japanese characters actually used in the UI.
const shippori = localFont({
  src: "../../../fonts/shippori-mincho/ShipporiMincho-subset.woff2",
  weight: "800",
  variable: "--font-shippori",
  display: "swap",
});
const vazirmatn = localFont({
  src: "../../../fonts/vazirmatn/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  display: "swap",
  weight: "100 900",
});
const jetbrainsMono = localFont({
  src: "../../../fonts/jetbrains-mono/JetBrainsMono-Variable.woff2",
  variable: "--font-jetbrains",
  display: "swap",
  weight: "100 800",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: `NewSushi — ${t("title")}`,
      template: "%s | NewSushi",
    },
    description: t("subtitle"),
    alternates: {
      languages: {
        fa: "/fa",
        en: "/en",
        ja: "/ja",
      },
    },
    openGraph: {
      title: `NewSushi — ${t("title")}`,
      description: t("subtitle"),
      locale,
      type: "website",
    },
  };
}

const DIR_BY_LOCALE: Record<string, "rtl" | "ltr"> = {
  fa: "rtl",
  en: "ltr",
  ja: "ltr",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const initialAccent = await getAccentTheme();

  return (
    <html lang={locale} dir={DIR_BY_LOCALE[locale]} data-accent={initialAccent} suppressHydrationWarning>
      <body className={`${shippori.variable} ${vazirmatn.variable} ${jetbrainsMono.variable}`}>
        <NextIntlClientProvider>
          <DayNightProvider>
            <AccentInit initialAccent={initialAccent} />
            {children}
          </DayNightProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
