import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Starfield } from "@/components/three/starfield";
import { AnimatedHeadline } from "@/components/home/animated-headline";
import { ProductBrowser } from "@/components/home/product-browser";
import { getCategories, getProducts } from "@/lib/api";
import type { Category, Locale, Product } from "@/lib/types";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return <HomeContent locale={locale as Locale} products={products} categories={categories} />;
}

function HomeContent({
  locale,
  products,
  categories,
}: {
  locale: Locale;
  products: Product[];
  categories: Category[];
}) {
  const t = useTranslations("hero");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        name: "NewSushi",
        alternateName: "新寿司",
        url: siteUrl,
        servesCuisine: "Japanese",
        priceRange: "$$",
      },
      {
        "@type": "WebSite",
        name: "NewSushi",
        url: siteUrl,
        inLanguage: ["fa", "en", "ja"],
      },
    ],
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-script-component-in-head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <section className="relative overflow-hidden px-6 pb-10 pt-14 md:pt-20">
        <Starfield />
        <div className="relative mx-auto max-w-3xl text-center">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            {t("eyebrow")}
          </span>
          <AnimatedHeadline
            text={t("title")}
            className="mt-5 font-display text-4xl leading-tight md:text-6xl"
          />
          <p className="mt-4 text-lg" style={{ color: "var(--ink-soft)" }}>
            {t("subtitle")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              className="rounded-full px-6 py-3 text-sm font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            >
              {t("cta")}
            </button>
            <button
              className="rounded-full border px-6 py-3 text-sm font-medium"
              style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            >
              {t("ctaSecondary")}
            </button>
          </div>
        </div>
      </section>

      <ProductBrowser locale={locale} products={products} categories={categories} />

      <Footer />
    </>
  );
}
