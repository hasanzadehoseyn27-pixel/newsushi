import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Product3DSlider } from "@/components/product/product-slider-3d";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductCard } from "@/components/product/product-card";
import {
  getCategories,
  getProduct,
  getProducts,
  localizedCategoryName,
  localizedDescription,
  localizedIngredients,
  localizedName,
  resolveImageUrl,
} from "@/lib/api";
import type { Locale } from "@/lib/types";

const CATEGORY_EMOJI: Record<string, string> = {
  nigiri: "🍣",
  maki: "🍙",
  sashimi: "🐟",
  temaki: "🌯",
  special: "✨",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const name = localizedName(product, locale as Locale);
  const description =
    localizedDescription(product, locale as Locale) ||
    localizedIngredients(product, locale as Locale).join("، ");

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      images: product.images[0] ? [resolveImageUrl(product.images[0])] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [product, categories] = await Promise.all([getProduct(slug), getCategories()]);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.category_id);
  const related = (await getProducts(category?.slug)).filter((p) => p.slug !== product.slug).slice(0, 3);

  const t = await getTranslations({ locale, namespace: "product" });
  const name = localizedName(product, locale as Locale);
  const description = localizedDescription(product, locale as Locale);
  const ingredients = localizedIngredients(product, locale as Locale);
  const images = product.images.map(resolveImageUrl);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || ingredients.join("، "),
    image: images,
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: product.price_toman * 10, // Toman -> Rial for schema.org convention
      availability: product.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-script-component-in-head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="px-6 py-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div
            className="rounded-[var(--radius-lg)] border p-6"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <Product3DSlider
              images={images}
              alt={name}
              fallbackEmoji={CATEGORY_EMOJI[category?.slug ?? ""] ?? "🍣"}
            />
          </div>

          <div>
            {category && (
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                {localizedCategoryName(category, locale as Locale)}
              </span>
            )}

            <h1 className="mt-4 font-display text-3xl md:text-4xl" style={{ color: "var(--ink)" }}>
              {name}
              {product.is_spicy && <span className="ms-2 text-xl">🌶️</span>}
            </h1>

            {description && (
              <p className="mt-4 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {description}
              </p>
            )}

            {ingredients.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-medium" style={{ color: "var(--ink-soft)" }}>
                  {t("ingredients")}
                </h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {ingredients.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border px-3 py-1 text-sm"
                      style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-8 font-mono text-2xl" style={{ color: "var(--accent)" }}>
              {product.price_toman.toLocaleString("fa-IR")} {t("currency")}
            </p>

            <div className="mt-6">
              {product.is_available ? (
                <AddToCartButton
                  slug={product.slug}
                  name={name}
                  price={product.price_toman}
                  image={images[0]}
                />
              ) : (
                <span
                  className="inline-block rounded-full border px-6 py-3 text-sm"
                  style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
                >
                  {t("outOfStock")}
                </span>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <RelatedSection locale={locale as Locale} products={related} categorySlug={category?.slug} />
        )}
      </main>

      <Footer />
    </>
  );
}

function RelatedSection({
  locale,
  products,
  categorySlug,
}: {
  locale: Locale;
  products: Awaited<ReturnType<typeof getProducts>>;
  categorySlug?: string;
}) {
  const t = useTranslations("product");
  return (
    <section className="mx-auto mt-16 max-w-6xl">
      <h2 className="font-display text-xl" style={{ color: "var(--ink)" }}>
        {t("related")}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} locale={locale} categorySlug={categorySlug} />
        ))}
      </div>
    </section>
  );
}
