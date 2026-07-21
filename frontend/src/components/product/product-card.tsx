"use client";

import { useState, type CSSProperties, type PointerEvent } from "react";
import { motion, type TargetAndTransition } from "framer-motion";
import { useTranslations } from "next-intl";
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
  float: { y: -14, rotate: -2, scale: 1.025, transition: { type: "spring", stiffness: 220, damping: 12 } },
  steam: { y: -8, scale: 1.04, transition: { duration: 0.4 } },
  wave: { y: -8, rotate: [0, -3, 3, -2, 0], scale: 1.025, transition: { duration: 0.6 } },
  glow: { y: -10, scale: 1.055, transition: { duration: 0.3 } },
  petals: { y: -12, rotate: 1.5, scale: 1.03, transition: { type: "spring", stiffness: 180, damping: 10 } },
};

export function ProductCard({
  product,
  locale,
  categorySlug,
}: {
  product: Product;
  locale: Locale;
  categorySlug?: string;
}) {
  const t = useTranslations("product");
  const name = localizedName(product, locale);
  const cover = product.images[0] ? resolveImageUrl(product.images[0]) : undefined;
  const [pointerVars, setPointerVars] = useState<CSSProperties>({
    "--mx": 0.46,
    "--my": 0.38,
  } as CSSProperties);

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointerVars({
      "--mx": (e.clientX - rect.left) / rect.width,
      "--my": (e.clientY - rect.top) / rect.height,
    } as CSSProperties);
  };

  return (
    <Link href={{ pathname: "/products/[slug]", params: { slug: product.slug } }}>
      <motion.article
        onPointerMove={handlePointerMove}
        whileHover={HOVER_VARIANTS[product.animation]}
        whileTap={{ scale: 0.98 }}
        className="sushi-cut-card group relative min-h-[18rem] overflow-hidden rounded-[var(--radius-md)] border p-5 shadow-[0_18px_50px_rgba(12,16,22,0.12)]"
        style={{
          ...pointerVars,
          borderColor: "var(--line)",
        }}
      >
        <span className="pointer-events-none absolute inset-x-4 top-0 h-0.5 opacity-60" style={{ background: "var(--accent)" }} aria-hidden />
        <span
          className="dream-card-shine pointer-events-none absolute -left-20 top-0 hidden h-full w-16 bg-white/45 blur-sm group-hover:block"
          aria-hidden
        />

        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border bg-black/95 text-6xl">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={name}
              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
              draggable={false}
            />
          ) : (
            <>
              {product.animation === "steam" && (
                <span
                  className="absolute -top-3 left-1/2 h-10 w-8 -translate-x-1/2 rounded-full opacity-0 blur-md transition-all duration-700 group-hover:-translate-y-4 group-hover:opacity-30"
                  style={{ background: "var(--ink-soft)" }}
                  aria-hidden
                />
              )}
              <motion.span
                className="relative"
                animate={{ y: [0, -5, 0], rotate: [0, -2, 2, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              >
                {PLATE_EMOJI[categorySlug ?? ""] ?? "🍣"}
              </motion.span>
            </>
          )}
        </div>

        {product.is_spicy && (
          <span
            className="absolute top-4 rtl:left-4 ltr:right-4 rounded-full border px-2 py-0.5 text-xs font-medium"
            style={{ background: "var(--lacquer-black)", borderColor: "var(--accent)", color: "var(--rice-white)" }}
          >
            🌶️
          </span>
        )}

        <h3 className="relative mt-4 font-display text-lg" style={{ color: "var(--ink)" }}>
          {name}
        </h3>
        <p className="relative mt-1 font-mono text-sm" style={{ color: "var(--accent)" }}>
          {product.price_toman.toLocaleString("fa-IR")} {t("currency")}
        </p>
      </motion.article>
    </Link>
  );
}
