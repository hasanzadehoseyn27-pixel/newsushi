"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { adminListCategories, adminListProducts } from "@/lib/admin-api";
import type { Category, Product } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([adminListCategories(), adminListProducts()]).then(([cats, products]) => {
      setCategories(cats);
      const found = products.find((p) => p.id === Number(params.id));
      if (found) setProduct(found);
      else setNotFound(true);
    });
  }, [params.id]);

  return (
    <AdminGuard>
      <AdminShell>
        <h1 className="mb-6 text-2xl" style={{ color: "var(--ink)" }}>
          ویرایش محصول
        </h1>
        {notFound && <p style={{ color: "var(--accent)" }}>محصول پیدا نشد.</p>}
        {product && categories.length > 0 && (
          <ProductForm categories={categories} initial={product} />
        )}
      </AdminShell>
    </AdminGuard>
  );
}
