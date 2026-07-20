import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  slug: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.slug === line.slug);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.slug === line.slug ? { ...l, qty: l.qty + qty } : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, qty }] };
        }),
      remove: (slug) => set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),
      setQty: (slug, qty) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.slug === slug ? { ...l, qty: Math.max(1, qty) } : l)),
        })),
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    }),
    { name: "newsushi-cart" }
  )
);
