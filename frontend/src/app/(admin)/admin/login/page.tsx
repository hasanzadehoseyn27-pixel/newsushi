"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, AdminApiError } from "@/lib/admin-api";
import { useAdminAuthStore } from "@/lib/admin-auth-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const setToken = useAdminAuthStore((s) => s.setToken);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await adminLogin(username, password);
      setToken(access_token);
      router.replace("/admin/products");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "خطا در ورود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[var(--radius-lg)] border p-8"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <h1 className="text-center text-2xl" style={{ color: "var(--ink)" }}>
          🍣 ورود به پنل NewSushi
        </h1>

        <div className="mt-6 flex flex-col gap-4">
          <input
            type="text"
            placeholder="نام کاربری"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="rounded-lg border px-4 py-2.5 outline-none"
            style={{ borderColor: "var(--line)", background: "var(--bg)", color: "var(--ink)" }}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-2.5 pe-11 outline-none"
              style={{ borderColor: "var(--line)", background: "var(--bg)", color: "var(--ink)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
              className="absolute top-1/2 -translate-y-1/2 end-3 text-lg"
              style={{ color: "var(--ink-soft)" }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm" style={{ color: "var(--accent)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full py-3 text-sm font-medium disabled:opacity-60"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
}
