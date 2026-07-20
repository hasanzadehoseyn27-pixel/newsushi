export interface MockProduct {
  slug: string;
  category: "nigiri" | "maki" | "sashimi" | "temaki" | "special";
  name: { fa: string; en: string; ja: string };
  price: number; // in Toman
  spicy?: boolean;
  ingredients: { fa: string[]; en: string[]; ja: string[] };
  animation: "float" | "steam" | "wave" | "glow" | "petals";
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    slug: "salmon-nigiri",
    category: "nigiri",
    name: { fa: "نیگیری سالمون", en: "Salmon Nigiri", ja: "サーモン握り" },
    price: 185000,
    ingredients: {
      fa: ["سالمون تازه", "برنج سرکه‌ای", "وسابی"],
      en: ["Fresh salmon", "Vinegared rice", "Wasabi"],
      ja: ["新鮮なサーモン", "酢飯", "わさび"],
    },
    animation: "float",
  },
  {
    slug: "spicy-tuna-maki",
    category: "maki",
    name: { fa: "ماکی تن تند", en: "Spicy Tuna Maki", ja: "スパイシーツナ巻き" },
    price: 220000,
    spicy: true,
    ingredients: {
      fa: ["تن", "سس تند", "خیار", "نوری"],
      en: ["Tuna", "Spicy sauce", "Cucumber", "Nori"],
      ja: ["ツナ", "スパイシーソース", "きゅうり", "海苔"],
    },
    animation: "wave",
  },
  {
    slug: "chef-special-dragon",
    category: "special",
    name: { fa: "دراگون رول ویژه شف", en: "Chef's Dragon Roll", ja: "シェフのドラゴンロール" },
    price: 340000,
    ingredients: {
      fa: ["میگو تمپورا", "آووکادو", "سس اوناگی", "کنجد"],
      en: ["Tempura shrimp", "Avocado", "Unagi sauce", "Sesame"],
      ja: ["エビ天ぷら", "アボカド", "うなぎソース", "ごま"],
    },
    animation: "glow",
  },
  {
    slug: "salmon-sashimi",
    category: "sashimi",
    name: { fa: "ساشیمی سالمون", en: "Salmon Sashimi", ja: "サーモン刺身" },
    price: 260000,
    ingredients: {
      fa: ["سالمون", "تربچه ژاپنی", "برگ شیسو"],
      en: ["Salmon", "Daikon radish", "Shiso leaf"],
      ja: ["サーモン", "大根", "しその葉"],
    },
    animation: "petals",
  },
  {
    slug: "veggie-temaki",
    category: "temaki",
    name: { fa: "تماکی سبزیجات", en: "Veggie Temaki", ja: "野菜手巻き" },
    price: 145000,
    ingredients: {
      fa: ["خیار", "آووکادو", "هویج", "نوری"],
      en: ["Cucumber", "Avocado", "Carrot", "Nori"],
      ja: ["きゅうり", "アボカド", "にんじん", "海苔"],
    },
    animation: "steam",
  },
  {
    slug: "eel-nigiri",
    category: "nigiri",
    name: { fa: "نیگیری اوناگی", en: "Unagi Nigiri", ja: "うなぎ握り" },
    price: 210000,
    ingredients: {
      fa: ["مارماهی دودی", "برنج سرکه‌ای", "سس اوناگی"],
      en: ["Smoked eel", "Vinegared rice", "Unagi sauce"],
      ja: ["蒲焼うなぎ", "酢飯", "うなぎソース"],
    },
    animation: "glow",
  },
];
