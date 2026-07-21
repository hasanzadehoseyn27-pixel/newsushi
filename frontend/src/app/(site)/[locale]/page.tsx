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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <section className="lacquer-panel redline-frame relative min-h-[34rem] overflow-hidden px-6 pb-10 pt-14 md:pt-20">
        <Starfield />
        <div className="relative mx-auto max-w-4xl py-8 text-center md:py-14">
          <span
            className="inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
            style={{ background: "rgba(255,255,255,0.9)", borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            {t("eyebrow")}
          </span>
          <AnimatedHeadline
            text={t("title")}
            className="mt-5 font-display text-4xl leading-tight text-[var(--rice-white)] drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)] md:text-6xl"
          />
          <p className="mx-auto mt-4 max-w-2xl text-lg" style={{ color: "rgba(255,250,246,0.78)" }}>
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#menu"
              className="rounded-full px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-1"
              style={{
                background: "var(--accent)",
                color: "var(--accent-ink)",
                boxShadow: "0 18px 46px color-mix(in srgb, var(--accent) 24%, transparent)",
              }}
            >
              {t("cta")}
            </a>
            <a
              href="#menu"
              className="rounded-full border px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-1"
              style={{ borderColor: "rgba(255,255,255,0.38)", color: "var(--rice-white)" }}
            >
              {t("ctaSecondary")}
            </a>
          </div>
        </div>
      </section>

      <ProductBrowser locale={locale} products={products} categories={categories} />

      <Footer />
    </>
  );
}
