import { useAdminAuthStore } from "@/lib/admin-auth-store";
import type { AccentTheme, Category, Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAdminAuthStore.getState().token;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    useAdminAuthStore.getState().logout();
    throw new AdminApiError("نشست شما منقضی شده، دوباره وارد شوید", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(body.detail ?? "خطای ناشناخته", res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// --- auth ---
export async function adminLogin(username: string, password: string) {
  return adminFetch<{ access_token: string; token_type: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function adminMe() {
  return adminFetch<{ id: number; username: string; is_superadmin: boolean }>(
    "/api/auth/me"
  );
}

// --- categories ---
export async function adminListCategories() {
  return adminFetch<Category[]>("/api/categories");
}
export async function adminCreateCategory(data: Omit<Category, "id">) {
  return adminFetch<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function adminUpdateCategory(id: number, data: Partial<Omit<Category, "id">>) {
  return adminFetch<Category>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
export async function adminDeleteCategory(id: number) {
  return adminFetch<void>(`/api/categories/${id}`, { method: "DELETE" });
}

// --- products ---
export async function adminListProducts() {
  return adminFetch<Product[]>("/api/products");
}
export async function adminGetProduct(slug: string) {
  return adminFetch<Product>(`/api/products/${slug}`);
}
export type ProductPayload = Omit<Product, "id" | "created_at" | "updated_at">;

export async function adminCreateProduct(data: ProductPayload) {
  return adminFetch<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function adminUpdateProduct(id: number, data: Partial<ProductPayload>) {
  return adminFetch<Product>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
export async function adminDeleteProduct(id: number) {
  return adminFetch<void>(`/api/products/${id}`, { method: "DELETE" });
}

// --- uploads ---
export async function adminUploadImage(file: File): Promise<string> {
  const token = useAdminAuthStore.getState().token;
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/uploads/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(body.detail ?? "آپلود تصویر ناموفق بود", res.status);
  }
  const data = await res.json();
  return data.url as string;
}

// --- settings ---
export async function adminGetSettings() {
  return adminFetch<{ accent_theme: AccentTheme }>("/api/settings");
}
export async function adminUpdateSettings(accent_theme: AccentTheme) {
  return adminFetch<{ accent_theme: AccentTheme }>("/api/settings", {
    method: "PUT",
    body: JSON.stringify({ accent_theme }),
  });
}

export function resolveAdminImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path}`;
}
