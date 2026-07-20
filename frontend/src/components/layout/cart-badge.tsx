"use client";

import { useCartStore } from "@/lib/cart-store";

export function CartBadge() {
  const count = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.qty, 0));

  if (count === 0) return null;

  return (
    <span
      className="absolute -top-1.5 -end-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold"
      style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
