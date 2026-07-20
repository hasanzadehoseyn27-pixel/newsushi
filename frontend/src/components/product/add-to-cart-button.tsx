"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/cart-store";

export function AddToCartButton({
  slug,
  name,
  price,
  image,
}: {
  slug: string;
  name: string;
  price: number;
  image?: string;
}) {
  const add = useCartStore((s) => s.add);
  const t = useTranslations("product");
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
    add({ slug, name, price, image });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-medium"
      style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
    >
      <AnimatePresence mode="wait">
        {justAdded ? (
          <motion.span
            key="done"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
          >
            ✓ افزوده شد
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
          >
            {t("addToCart")}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
