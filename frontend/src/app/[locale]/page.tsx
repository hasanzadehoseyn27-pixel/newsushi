import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Starfield } from "@/components/three/starfield";
import { ProductCard } from "@/components/product/product-card";
import { getCategories, getProducts, localizedCategoryName } from "@/lib/api";
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

  const categoryBySlugId = new Map(categories.map((c) => [c.id, c.slug]));

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
              key={cat.slug}
              className="shrink-0 rounded-full px-4 py-2 text-sm"
              style={{ background: "var(--surface-2)", color: "var(--ink)" }}
            >
              {localizedCategoryName(cat, locale)}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              locale={locale}
              categorySlug={categoryBySlugId.get(product.category_id)}
            />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
