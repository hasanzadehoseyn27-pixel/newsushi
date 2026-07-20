"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminGetSettings, adminUpdateSettings, AdminApiError } from "@/lib/admin-api";
import { ACCENT_LABELS } from "@/lib/animation-presets";
import type { AccentTheme } from "@/lib/types";

export default function AdminThemePage() {
  return (
    <AdminGuard>
      <AdminShell>
        <ThemePicker />
      </AdminShell>
    </AdminGuard>
  );
}

function ThemePicker() {
  const [current, setCurrent] = useState<AccentTheme | null>(null);
  const [saving, setSaving] = useState<AccentTheme | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminGetSettings().then((s) => setCurrent(s.accent_theme));
  }, []);

  const handleSelect = async (accent: AccentTheme) => {
    setSaving(accent);
    setError("");
    try {
      const res = await adminUpdateSettings(accent);
      setCurrent(res.accent_theme);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl" style={{ color: "var(--ink)" }}>
        تم رنگی سایت
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
        رنگ غالب کل فروشگاه رو از اینجا عوض کن. مشتری‌ها بعد از رفرش صفحه، رنگ جدید رو می‌بینن.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {ACCENT_LABELS.map((theme) => (
          <button
            key={theme.value}
            onClick={() => handleSelect(theme.value as AccentTheme)}
            disabled={saving !== null}
            className="flex flex-col items-center gap-3 rounded-[var(--radius-md)] border p-5 transition-transform hover:scale-105"
            style={{
              borderColor: current === theme.value ? theme.hex : "var(--line)",
              borderWidth: current === theme.value ? 2 : 1,
              background: "var(--surface)",
            }}
          >
            <span
              className="h-12 w-12 rounded-full"
              style={{ background: theme.hex, boxShadow: current === theme.value ? `0 0 0 4px ${theme.hex}33` : "none" }}
            />
            <span className="text-sm" style={{ color: "var(--ink)" }}>
              {theme.label}
            </span>
            {current === theme.value && (
              <span className="text-xs" style={{ color: theme.hex }}>
                فعال ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm" style={{ color: "var(--accent)" }}>{error}</p>}
    </div>
  );
}
