"use client";

import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";

export default function CartPage() {
  const { lines, remove, setQty, total, clear } = useCartStore();
  const t = useTranslations("cart");

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-3xl" style={{ color: "var(--ink)" }}>
          {t("title")}
        </h1>

        {lines.length === 0 ? (
          <p className="mt-8" style={{ color: "var(--ink-soft)" }}>
            {t("empty")}
          </p>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-4">
              {lines.map((line) => (
                <div
                  key={line.slug}
                  className="flex items-center gap-4 rounded-[var(--radius-md)] border p-4"
                  style={{ borderColor: "var(--line)", background: "var(--surface)" }}
                >
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg text-3xl"
                    style={{ background: "var(--surface-2)" }}
                  >
                    {line.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.image} alt={line.name} className="h-full w-full object-cover" />
                    ) : (
                      "🍣"
                    )}
                  </div>

                  <div className="flex-1">
                    <p style={{ color: "var(--ink)" }}>{line.name}</p>
                    <p className="mt-1 font-mono text-sm" style={{ color: "var(--accent)" }}>
                      {line.price.toLocaleString("fa-IR")} {t("currency")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.qty - 1)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border"
                      style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-mono" style={{ color: "var(--ink)" }}>
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.qty + 1)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border"
                      style={{ borderColor: "var(--line)", color: "var(--ink)" }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(line.slug)}
                    className="cursor-pointer text-sm underline"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {t("remove")}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--line)" }}>
              <button
                type="button"
                onClick={clear}
                className="text-sm underline"
                style={{ color: "var(--ink-soft)" }}
              >
                {t("clear")}
              </button>
              <p className="font-mono text-xl" style={{ color: "var(--accent)" }}>
                {t("total")}: {total().toLocaleString("fa-IR")} {t("currency")}
              </p>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-full py-3 text-center text-sm font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            >
              {t("checkout")}
            </Link>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
