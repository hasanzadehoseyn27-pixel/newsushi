"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import { localizedCategoryName } from "@/lib/api";
import type { Category, Locale, Product } from "@/lib/types";

export function ProductBrowser({
  locale,
  products,
  categories,
}: {
  locale: Locale;
  products: Product[];
  categories: Category[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const categoryBySlugId = useMemo(
    () => new Map(categories.map((c) => [c.id, c.slug])),
    [categories]
  );

  const filtered = active === null ? products : products.filter((p) => p.category_id === active);

  return (
    <>
      {/* Category rail — styled like a kaiten-zushi conveyor belt */}
      <section className="px-6 py-4">
        <div
          className="mx-auto flex max-w-6xl gap-2.5 overflow-x-auto rounded-full border p-2"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
        >
          <CategoryPill
            label={locale === "fa" ? "همه" : locale === "ja" ? "すべて" : "All"}
            selected={active === null}
            onClick={() => setActive(null)}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={localizedCategoryName(cat, locale)}
              selected={active === cat.id}
              onClick={() => setActive(cat.id)}
            />
          ))}
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              locale={locale}
              categorySlug={categoryBySlugId.get(product.category_id)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function CategoryPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
      style={{ color: selected ? "var(--accent-ink)" : "var(--ink)" }}
    >
      {selected && (
        <motion.span
          layoutId="category-pill-bg"
          className="absolute inset-0 rounded-full"
          style={{ background: "var(--accent)" }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        />
      )}
      <span className="relative">{label}</span>
    </motion.button>
  );
}
