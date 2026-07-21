"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminListCategories,
  adminTranslateFromPersian,
  AdminApiError,
} from "@/lib/admin-api";
import { slugifyPersian } from "@/lib/transliteration";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <CategoriesManager />
      </AdminShell>
    </AdminGuard>
  );
}

const inputStyle = { borderColor: "var(--line)", background: "var(--bg)", color: "var(--ink)" } as const;

function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ slug: "", name_fa: "", name_en: "", name_ja: "" });
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const load = () => adminListCategories().then(setCategories);

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminCreateCategory({ ...form, sort_order: categories.length + 1 });
      setForm({ slug: "", name_fa: "", name_en: "", name_ja: "" });
      load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("این دسته‌بندی حذف شود؟ (محصولات وابسته هم حذف می‌شوند)")) return;
    await adminDeleteCategory(id);
    load();
  };

  const fillTranslations = async () => {
    if (!form.name_fa.trim()) return;
    setTranslating(true);
    setError("");
    try {
      const [en, ja] = await Promise.all([
        adminTranslateFromPersian(form.name_fa, "en"),
        adminTranslateFromPersian(form.name_fa, "ja"),
      ]);
      setForm({
        ...form,
        slug: form.slug || slugifyPersian(form.name_fa),
        name_en: en || form.name_en,
        name_ja: ja || form.name_ja,
      });
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "ترجمه گوگل انجام نشد");
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl" style={{ color: "var(--ink)" }}>
        دسته‌بندی‌ها
      </h1>

      <div className="mt-6 flex flex-col gap-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-lg border p-3"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          >
            <div>
              <span style={{ color: "var(--ink)" }}>{c.name_fa}</span>
              <span className="ms-2 text-xs" style={{ color: "var(--ink-soft)" }}>
                {c.name_en} · {c.name_ja} · /{c.slug}
              </span>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-sm" style={{ color: "var(--accent)" }}>
              حذف
            </button>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAdd}
        className="mt-8 grid max-w-2xl grid-cols-2 gap-3 rounded-[var(--radius-md)] border p-5 sm:grid-cols-4"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <input placeholder="اسلاگ" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
        <input placeholder="فارسی" value={form.name_fa} onChange={(e) => setForm({ ...form, name_fa: e.target.value })} required className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
        <input placeholder="English" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} required className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
        <input placeholder="日本語" value={form.name_ja} onChange={(e) => setForm({ ...form, name_ja: e.target.value })} required className="rounded-lg border px-3 py-2 text-sm outline-none" style={inputStyle} />
        <button
          type="button"
          disabled={!form.name_fa.trim() || translating}
          onClick={fillTranslations}
          className="col-span-2 rounded-full border px-5 py-2 text-sm font-medium disabled:opacity-45 sm:col-span-4"
          style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-soft)" }}
        >
          {translating ? "در حال ترجمه..." : "ترجمه با Google Translate"}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="col-span-2 mt-1 rounded-full px-5 py-2 text-sm font-medium sm:col-span-4"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {saving ? "..." : "+ افزودن دسته‌بندی"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm" style={{ color: "var(--accent)" }}>{error}</p>}
    </div>
  );
}
