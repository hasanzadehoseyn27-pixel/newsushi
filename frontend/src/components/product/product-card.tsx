"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { localizedName, resolveImageUrl } from "@/lib/api";
import type { AnimationPreset, Locale, Product } from "@/lib/types";

const PLATE_EMOJI: Record<string, string> = {
  nigiri: "🍣",
  maki: "🍙",
  sashimi: "🐟",
  temaki: "🌯",
  special: "✨",
};

/** Per-animation hover behavior — each named preset feels distinct, not a copy-paste variant. */
const HOVER_VARIANTS: Record<AnimationPreset, TargetAndTransition> = {
  float: { y: -10, rotate: -2, transition: { type: "spring", stiffness: 220, damping: 12 } },
  steam: { y: -6, scale: 1.03, transition: { duration: 0.4 } },
  wave: { rotate: [0, -3, 3, -2, 0], transition: { duration: 0.6 } },
  glow: { scale: 1.05, transition: { duration: 0.3 } },
  petals: { y: -8, rotate: 1.5, transition: { type: "spring", stiffness: 180, damping: 10 } },
};

export function ProductCard({
  product,
  locale,
  categorySlug,
  currency = "تومان",
}: {
  product: Product;
  locale: Locale;
  categorySlug?: string;
  currency?: string;
}) {
  const name = localizedName(product, locale);
  const cover = product.images[0] ? resolveImageUrl(product.images[0]) : undefined;

  return (
    <Link href={{ pathname: "/products/[slug]", params: { slug: product.slug } }}>
      <motion.article
        whileHover={HOVER_VARIANTS[product.animation]}
        whileTap={{ scale: 0.97 }}
        className="group relative overflow-hidden rounded-[var(--radius-lg)] border p-5"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        {product.animation === "glow" && (
          <span
            className="pointer-events-none absolute -inset-10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
            style={{ background: "var(--accent-2)" }}
            aria-hidden
          />
        )}

        <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-[var(--radius-md)] text-6xl">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={name} className="h-full w-full object-cover" />
          ) : (
            <>
              {product.animation === "steam" && (
                <span
                  className="absolute -top-3 left-1/2 h-10 w-8 -translate-x-1/2 rounded-full opacity-0 blur-md transition-all duration-700 group-hover:-translate-y-4 group-hover:opacity-30"
                  style={{ background: "var(--ink-soft)" }}
                  aria-hidden
                />
              )}
              <span className="relative">{PLATE_EMOJI[categorySlug ?? ""] ?? "🍣"}</span>
            </>
          )}
        </div>

        {product.is_spicy && (
          <span
            className="absolute top-4 rtl:left-4 ltr:right-4 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            🌶️
          </span>
        )}

        <h3 className="mt-3 font-display text-lg" style={{ color: "var(--ink)" }}>
          {name}
        </h3>
        <p className="mt-1 font-mono text-sm" style={{ color: "var(--accent)" }}>
          {product.price_toman.toLocaleString("fa-IR")} {currency}
        </p>
      </motion.article>
    </Link>
  );
}
