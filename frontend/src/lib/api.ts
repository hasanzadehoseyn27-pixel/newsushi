import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { AccentTheme, Category, Locale, Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Converts the lightweight local mock shape into the API's Product shape, as a offline fallback. */
function mockToProduct(mock: (typeof MOCK_PRODUCTS)[number], id: number): Product {
  const categoryIndex = ["nigiri", "maki", "sashimi", "temaki", "special"].indexOf(
    mock.category
  );
  return {
    id,
    slug: mock.slug,
    category_id: categoryIndex + 1,
    name_fa: mock.name.fa,
    name_en: mock.name.en,
    name_ja: mock.name.ja,
    description_fa: "",
    description_en: "",
    description_ja: "",
    ingredients_fa: mock.ingredients.fa,
    ingredients_en: mock.ingredients.en,
    ingredients_ja: mock.ingredients.ja,
    price_toman: mock.price,
    is_spicy: !!mock.spicy,
    is_available: true,
    animation: mock.animation,
    images: [],
    sort_order: id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

const FALLBACK_PRODUCTS: Product[] = MOCK_PRODUCTS.map((m, i) => mockToProduct(m, i + 1));

const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, slug: "nigiri", name_fa: "نیگیری", name_en: "Nigiri", name_ja: "握り", sort_order: 1 },
  { id: 2, slug: "maki", name_fa: "ماکی", name_en: "Maki", name_ja: "巻き寿司", sort_order: 2 },
  { id: 3, slug: "sashimi", name_fa: "ساشیمی", name_en: "Sashimi", name_ja: "刺身", sort_order: 3 },
  { id: 4, slug: "temaki", name_fa: "تماکی", name_en: "Temaki", name_ja: "手巻き", sort_order: 4 },
  { id: 5, slug: "special", name_fa: "ویژه شف", name_en: "Chef's Special", name_ja: "シェフのおすすめ", sort_order: 5 },
];

async function safeFetch<T>(path: string, revalidateSeconds: number): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Backend not reachable (e.g. during local frontend-only work) — caller falls back to mock data.
    return null;
  }
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  const query = categorySlug ? `?category_slug=${categorySlug}` : "";
  const data = await safeFetch<Product[]>(`/api/products${query}`, 30);
  if (data) return data;
  return categorySlug
    ? FALLBACK_PRODUCTS.filter((p) => FALLBACK_CATEGORIES.find((c) => c.slug === categorySlug)?.id === p.category_id)
    : FALLBACK_PRODUCTS;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const data = await safeFetch<Product>(`/api/products/${slug}`, 30);
  if (data) return data;
  return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const data = await safeFetch<Category[]>("/api/categories", 60);
  return data ?? FALLBACK_CATEGORIES;
}

export async function getAccentTheme(): Promise<AccentTheme> {
  const data = await safeFetch<{ accent_theme: AccentTheme }>("/api/settings", 0);
  return data?.accent_theme ?? "ai";
}

export function resolveImageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path}`;
}

export function localizedName(product: Product, locale: Locale): string {
  return product[`name_${locale}`];
}

export function localizedDescription(product: Product, locale: Locale): string {
  return product[`description_${locale}`];
}

export function localizedIngredients(product: Product, locale: Locale): string[] {
  return product[`ingredients_${locale}`];
}

export function localizedCategoryName(category: Category, locale: Locale): string {
  return category[`name_${locale}`];
}
