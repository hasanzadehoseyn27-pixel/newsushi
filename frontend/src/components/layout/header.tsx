import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DayNightToggle } from "@/components/theme/day-night-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { CartBadge } from "@/components/layout/cart-badge";
import { AdminEntryLink } from "@/components/layout/admin-entry-link";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b px-6 py-4 backdrop-blur-md"
      style={{
        borderColor: "color-mix(in srgb, var(--accent) 46%, transparent)",
        background: "color-mix(in srgb, var(--lacquer-black) 88%, transparent)",
      }}
    >
      <Link href="/" className="text-xl tracking-wide" style={{ color: "var(--rice-white)", fontFamily: "var(--font-shippori), serif" }}>
        新<span style={{ color: "var(--accent)" }}>寿司</span>
      </Link>

      <nav className="hidden items-center gap-6 md:flex" style={{ color: "rgba(255,250,246,0.72)" }}>
        <Link href="/" className="text-sm hover:opacity-100" style={{ opacity: 0.85 }}>
          {t("home")}
        </Link>
        <Link href="/products" className="text-sm hover:opacity-100" style={{ opacity: 0.85 }}>
          {t("products")}
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <AdminEntryLink />
        <LocaleSwitcher />
        <DayNightToggle />
        <Link
          href="/cart"
          aria-label={t("cart")}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border text-xl"
          style={{ borderColor: "rgba(255,255,255,0.24)", background: "rgba(255,255,255,0.06)" }}
        >
          🛒
          <CartBadge />
        </Link>
      </div>
    </header>
  );
}
