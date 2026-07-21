import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Starfield } from "@/components/three/starfield";
import { ProductBrowser } from "@/components/home/product-browser";
import { getCategories, getProducts } from "@/lib/api";
import type { Locale } from "@/lib/types";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <Header />
      <ProductsHero locale={locale as Locale} />
      <ProductBrowser locale={locale as Locale} products={products} categories={categories} />
      <Footer />
    </>
  );
}

function ProductsHero({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  const title = locale === "fa" ? "منوی رویایی NewSushi" : locale === "ja" ? "NewSushiの夢のメニュー" : "NewSushi Dream Menu";

  return (
    <section className="relative overflow-hidden px-6 pb-8 pt-14">
      <Starfield />
      <div className="relative mx-auto max-w-3xl text-center">
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {t("products")}
        </span>
        <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl" style={{ color: "var(--ink)" }}>
          {title}
        </h1>
      </div>
    </section>
  );
}
