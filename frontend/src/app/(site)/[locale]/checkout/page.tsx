"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import { createOrder } from "@/lib/api";

const inputStyle = { borderColor: "var(--line)", background: "var(--surface)", color: "var(--ink)" } as const;

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const { lines, total, clear } = useCartStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await createOrder({
      customer_name: name,
      phone,
      address,
      notes,
      items: lines.map((l) => ({ slug: l.slug, name: l.name, price: l.price, qty: l.qty })),
    });

    setSubmitting(false);
    if (result) {
      setOrderId(result.id);
      clear();
    } else {
      setError("خطا در ثبت سفارش، دوباره تلاش کنید.");
    }
  };

  if (orderId !== null) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-lg px-6 py-20 text-center">
          <div className="text-5xl">✅</div>
          <p className="mt-4 text-lg" style={{ color: "var(--ink)" }}>
            {t("success")}
          </p>
          <p className="mt-2 font-mono text-sm" style={{ color: "var(--accent)" }}>
            #{orderId}
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full px-6 py-3 text-sm font-medium"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          >
            {t("backToShop")}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-lg px-6 py-20 text-center">
          <p style={{ color: "var(--ink-soft)" }}>{t("emptyCart")}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full border px-6 py-3 text-sm"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
          >
            {t("backToShop")}
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-3xl" style={{ color: "var(--ink)" }}>
          {t("title")}
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("name")}
              required
              className="rounded-lg border px-4 py-2.5 outline-none"
              style={inputStyle}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phone")}
              required
              type="tel"
              className="rounded-lg border px-4 py-2.5 outline-none"
              style={inputStyle}
            />
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("address")}
              required
              rows={3}
              className="rounded-lg border px-4 py-2.5 outline-none"
              style={inputStyle}
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notes")}
              rows={2}
              className="rounded-lg border px-4 py-2.5 outline-none"
              style={inputStyle}
            />

            {error && <p style={{ color: "var(--accent)" }}>{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full py-3 text-sm font-medium disabled:opacity-60"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </form>

          <div
            className="h-fit rounded-[var(--radius-md)] border p-5"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <h2 className="text-sm font-medium" style={{ color: "var(--ink-soft)" }}>
              {t("orderSummary")}
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {lines.map((line) => (
                <div key={line.slug} className="flex justify-between text-sm" style={{ color: "var(--ink)" }}>
                  <span>
                    {line.name} × {line.qty}
                  </span>
                  <span className="font-mono">
                    {(line.price * line.qty).toLocaleString("fa-IR")}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-4 flex justify-between border-t pt-3 font-mono text-lg"
              style={{ borderColor: "var(--line)", color: "var(--accent)" }}
            >
              <span className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {tc("total")}
              </span>
              <span>
                {total().toLocaleString("fa-IR")} {tc("currency")}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
