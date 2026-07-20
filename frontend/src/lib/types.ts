export type AnimationPreset = "float" | "steam" | "wave" | "glow" | "petals";
export type AccentTheme = "ai" | "wasabi" | "akane" | "yuzu" | "murasaki";

export interface Category {
  id: number;
  slug: string;
  name_fa: string;
  name_en: string;
  name_ja: string;
  sort_order: number;
}

export interface Product {
  id: number;
  slug: string;
  category_id: number;
  name_fa: string;
  name_en: string;
  name_ja: string;
  description_fa: string;
  description_en: string;
  description_ja: string;
  ingredients_fa: string[];
  ingredients_en: string[];
  ingredients_ja: string[];
  price_toman: number;
  is_spicy: boolean;
  is_available: boolean;
  animation: AnimationPreset;
  images: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface OrderItem {
  slug: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  notes: string;
  items: OrderItem[];
  total_toman: number;
  status: OrderStatus;
  created_at: string;
}

export type Locale = "fa" | "en" | "ja";
