"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/lib/admin-auth-store";

const NAV_ITEMS = [
  { href: "/admin/products", label: "محصولات", icon: "🍣" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: "📂" },
  { href: "/admin/theme", label: "تم رنگی سایت", icon: "🎨" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAdminAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <aside
        className="flex w-60 flex-col border-e p-5"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <div className="mb-8 font-display text-lg" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          🍣 پنل NewSushi
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                style={{
                  background: active ? "var(--accent-soft)" : "transparent",
                  color: active ? "var(--accent)" : "var(--ink-soft)",
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
        >
          خروج از حساب
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
