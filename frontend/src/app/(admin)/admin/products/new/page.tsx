"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { adminListCategories } from "@/lib/admin-api";
import type { Category } from "@/lib/types";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    adminListCategories().then(setCategories);
  }, []);

  return (
    <AdminGuard>
      <AdminShell>
        <h1 className="mb-6 text-2xl" style={{ color: "var(--ink)" }}>
          افزودن محصول جدید
        </h1>
        {categories.length > 0 && <ProductForm categories={categories} />}
      </AdminShell>
    </AdminGuard>
  );
}
