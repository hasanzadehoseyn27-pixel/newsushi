import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DayNightToggle } from "@/components/theme/day-night-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CartBadge } from "@/components/layout/cart-badge";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b px-6 py-4 backdrop-blur-md"
      style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 80%, transparent)" }}
    >
      <Link href="/" className="text-xl tracking-wide" style={{ color: "var(--ink)", fontFamily: "var(--font-shippori), serif" }}>
        新<span style={{ color: "var(--accent)" }}>寿司</span>
      </Link>

      <nav className="hidden items-center gap-6 md:flex" style={{ color: "var(--ink-soft)" }}>
        <Link href="/" className="text-sm hover:opacity-100" style={{ opacity: 0.85 }}>
          {t("home")}
        </Link>
        <Link href="/products" className="text-sm hover:opacity-100" style={{ opacity: 0.85 }}>
          {t("products")}
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        <DayNightToggle />
        <Link
          href="/cart"
          aria-label={t("cart")}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border text-xl"
          style={{ borderColor: "var(--line)" }}
        >
          🛒
          <CartBadge />
        </Link>
      </div>
    </header>
  );
}
