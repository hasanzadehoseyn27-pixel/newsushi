"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminDeleteProduct, adminListCategories, adminListProducts, AdminApiError } from "@/lib/admin-api";
import type { Category, Product } from "@/lib/types";

export default function AdminProductsPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <ProductsList />
      </AdminShell>
    </AdminGuard>
  );
}

function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([adminListProducts(), adminListCategories()]);
      setProducts(p);
      setCategories(c);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "خطا در بارگذاری");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("این محصول حذف شود؟")) return;
    await adminDeleteProduct(id);
    load();
  };

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name_fa ?? "—";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl" style={{ color: "var(--ink)" }}>
          محصولات
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full px-5 py-2.5 text-sm font-medium"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          + محصول جدید
        </Link>
      </div>

      {error && <p className="mt-4 text-sm" style={{ color: "var(--accent)" }}>{error}</p>}
      {loading ? (
        <p className="mt-6" style={{ color: "var(--ink-soft)" }}>در حال بارگذاری...</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: "var(--line)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface-2)", color: "var(--ink-soft)" }}>
                <th className="p-3 text-start">نام</th>
                <th className="p-3 text-start">دسته‌بندی</th>
                <th className="p-3 text-start">قیمت</th>
                <th className="p-3 text-start">وضعیت</th>
                <th className="p-3 text-start"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="p-3" style={{ color: "var(--ink)" }}>{p.name_fa}</td>
                  <td className="p-3" style={{ color: "var(--ink-soft)" }}>{categoryName(p.category_id)}</td>
                  <td className="p-3 font-mono" style={{ color: "var(--accent)" }}>
                    {p.price_toman.toLocaleString("fa-IR")}
                  </td>
                  <td className="p-3">
                    {p.is_available ? (
                      <span style={{ color: "var(--ink-soft)" }}>موجود</span>
                    ) : (
                      <span style={{ color: "var(--accent)" }}>ناموجود</span>
                    )}
                  </td>
                  <td className="p-3 text-end">
                    <Link href={`/admin/products/${p.id}`} className="me-3 underline" style={{ color: "var(--accent)" }}>
                      ویرایش
                    </Link>
                    <button onClick={() => handleDelete(p.id)} style={{ color: "var(--ink-soft)" }}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
