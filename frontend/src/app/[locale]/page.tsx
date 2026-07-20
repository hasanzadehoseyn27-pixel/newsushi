import { useTranslations } from "next-intl";
import { setRequestLocale, getLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Starfield } from "@/components/three/starfield";
import { ProductCard } from "@/components/product/product-card";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent locale={locale as "fa" | "en" | "ja"} />;
}

function HomeContent({ locale }: { locale: "fa" | "en" | "ja" }) {
  const t = useTranslations("hero");
  const tc = useTranslations("categories");

  const categories: Array<{ key: string; label: string }> = [
    { key: "nigiri", label: tc("nigiri") },
    { key: "maki", label: tc("maki") },
    { key: "sashimi", label: tc("sashimi") },
    { key: "temaki", label: tc("temaki") },
    { key: "special", label: tc("special") },
  ];

  return (
    <>
      <Header />

      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <Starfield />
        <div className="relative mx-auto max-w-3xl text-center">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            {t("eyebrow")}
          </span>
          <h1 className="mt-5 font-display text-4xl leading-tight md:text-6xl" style={{ color: "var(--ink)" }}>
            {t("title")}
          </h1>
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

      {/* Category rail — styled like a kaiten-zushi conveyor belt */}
      <section className="px-6 py-8">
        <div
          className="mx-auto flex max-w-6xl gap-3 overflow-x-auto rounded-full border p-2"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          {categories.map((cat) => (
            <span
              key={cat.key}
              className="shrink-0 rounded-full px-4 py-2 text-sm"
              style={{ background: "var(--surface-2)", color: "var(--ink)" }}
            >
              {cat.label}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
