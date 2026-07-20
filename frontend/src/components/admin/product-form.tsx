"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminUploadImage,
  AdminApiError,
  resolveAdminImageUrl,
  type ProductPayload,
} from "@/lib/admin-api";
import { ANIMATION_PRESETS } from "@/lib/animation-presets";
import type { Category, Product } from "@/lib/types";

const inputStyle = {
  borderColor: "var(--line)",
  background: "var(--bg)",
  color: "var(--ink)",
} as const;

function toCsv(list: string[]): string {
  return list.join("، ");
}
function fromCsv(value: string): string[] {
  return value
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Product;
}) {
  const router = useRouter();
  const isEdit = !!initial;

  const [form, setForm] = useState<ProductPayload>(
    initial
      ? {
          slug: initial.slug,
          category_id: initial.category_id,
          name_fa: initial.name_fa,
          name_en: initial.name_en,
          name_ja: initial.name_ja,
          description_fa: initial.description_fa,
          description_en: initial.description_en,
          description_ja: initial.description_ja,
          ingredients_fa: initial.ingredients_fa,
          ingredients_en: initial.ingredients_en,
          ingredients_ja: initial.ingredients_ja,
          price_toman: initial.price_toman,
          is_spicy: initial.is_spicy,
          is_available: initial.is_available,
          animation: initial.animation,
          images: initial.images,
          sort_order: initial.sort_order,
        }
      : {
          slug: "",
          category_id: categories[0]?.id ?? 0,
          name_fa: "",
          name_en: "",
          name_ja: "",
          description_fa: "",
          description_en: "",
          description_ja: "",
          ingredients_fa: [],
          ingredients_en: [],
          ingredients_ja: [],
          price_toman: 0,
          is_spicy: false,
          is_available: true,
          animation: "float",
          images: [],
          sort_order: 0,
        }
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof ProductPayload>(key: K, value: ProductPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await adminUploadImage(file);
      update("images", [...form.images, url]);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "خطا در آپلود");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url: string) =>
    update("images", form.images.filter((i) => i !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEdit && initial) {
        await adminUpdateProduct(initial.id, form);
      } else {
        await adminCreateProduct(form);
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
      {error && (
        <p className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
          {error}
        </p>
      )}

      <Field label="اسلاگ (شناسه در آدرس)">
        <input
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          required
          placeholder="salmon-nigiri"
          className="w-full rounded-lg border px-4 py-2.5 outline-none"
          style={inputStyle}
        />
      </Field>

      <Field label="دسته‌بندی">
        <select
          value={form.category_id}
          onChange={(e) => update("category_id", Number(e.target.value))}
          className="w-full rounded-lg border px-4 py-2.5 outline-none"
          style={inputStyle}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_fa}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="نام (فارسی)">
          <input value={form.name_fa} onChange={(e) => update("name_fa", e.target.value)} required className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="نام (English)">
          <input value={form.name_en} onChange={(e) => update("name_en", e.target.value)} required className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="نام (日本語)">
          <input value={form.name_ja} onChange={(e) => update("name_ja", e.target.value)} required className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="توضیحات (فارسی)">
          <textarea value={form.description_fa} onChange={(e) => update("description_fa", e.target.value)} rows={3} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="توضیحات (English)">
          <textarea value={form.description_en} onChange={(e) => update("description_en", e.target.value)} rows={3} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="توضیحات (日本語)">
          <textarea value={form.description_ja} onChange={(e) => update("description_ja", e.target.value)} rows={3} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="ترکیبات (فارسی) — با ، جدا کنید">
          <input value={toCsv(form.ingredients_fa)} onChange={(e) => update("ingredients_fa", fromCsv(e.target.value))} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="Ingredients (English) — comma separated">
          <input value={toCsv(form.ingredients_en)} onChange={(e) => update("ingredients_en", fromCsv(e.target.value))} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
        <Field label="材料（日本語）— カンマ区切り">
          <input value={toCsv(form.ingredients_ja)} onChange={(e) => update("ingredients_ja", fromCsv(e.target.value))} className="w-full rounded-lg border px-4 py-2.5 outline-none" style={inputStyle} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="قیمت (تومان)">
          <input
            type="number"
            min={0}
            value={form.price_toman}
            onChange={(e) => update("price_toman", Number(e.target.value))}
            required
            className="w-full rounded-lg border px-4 py-2.5 outline-none"
            style={inputStyle}
          />
        </Field>

        <Field label="انیمیشن نمایش محصول">
          <select
            value={form.animation}
            onChange={(e) => update("animation", e.target.value as ProductPayload["animation"])}
            className="w-full rounded-lg border px-4 py-2.5 outline-none"
            style={inputStyle}
          >
            {ANIMATION_PRESETS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label} — {a.hint}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--ink)" }}>
          <input type="checkbox" checked={form.is_spicy} onChange={(e) => update("is_spicy", e.target.checked)} />
          تند 🌶️
        </label>
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--ink)" }}>
          <input type="checkbox" checked={form.is_available} onChange={(e) => update("is_available", e.target.checked)} />
          موجود است
        </label>
      </div>

      <Field label="تصاویر محصول">
        <div className="flex flex-wrap gap-3">
          {form.images.map((img) => (
            <div key={img} className="relative h-24 w-24 overflow-hidden rounded-lg border" style={{ borderColor: "var(--line)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveAdminImageUrl(img)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(img)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100"
              >
                حذف
              </button>
            </div>
          ))}
          <label
            className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border text-sm"
            style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}
          >
            {uploading ? "..." : "+ افزودن"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full px-8 py-3 text-sm font-medium disabled:opacity-60"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "افزودن محصول"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border px-8 py-3 text-sm"
          style={{ borderColor: "var(--line)", color: "var(--ink)" }}
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm" style={{ color: "var(--ink-soft)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
