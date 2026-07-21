"use client";

import Link from "next/link";
import { useAdminAuthStore } from "@/lib/admin-auth-store";

export function AdminEntryLink() {
  const token = useAdminAuthStore((s) => s.token);

  if (!token) return null;

  return (
    <Link
      href="/admin/products"
      className="hidden rounded-full border px-3 py-2 text-xs font-bold md:inline-flex"
      style={{ borderColor: "rgba(255,255,255,0.24)", color: "var(--rice-white)" }}
    >
      پنل ادمین
    </Link>
  );
}
