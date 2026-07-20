"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminMe } from "@/lib/admin-api";
import { useAdminAuthStore } from "@/lib/admin-auth-store";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAdminAuthStore((s) => s.token);
  const logout = useAdminAuthStore((s) => s.logout);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    adminMe()
      .then(() => setChecked(true))
      .catch(() => {
        logout();
        router.replace("/admin/login");
      });
  }, [token, router, logout]);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ color: "var(--ink-soft)" }}>
        در حال بررسی ورود...
      </div>
    );
  }

  return <>{children}</>;
}
