type TranslationPair = {
  en: string;
  ja: string;
};

const PHRASES: Record<string, TranslationPair> = {
  "سلام": { en: "Hello", ja: "こんにちは" },
  "خوش آمدید": { en: "Welcome", ja: "ようこそ" },
  "توضیحات محصول": { en: "Product description", ja: "商品説明" },
  "محصول ویژه": { en: "Special product", ja: "特別商品" },
  "سوشی تازه": { en: "Fresh sushi", ja: "新鮮な寿司" },
  "نیگیری سالمون": { en: "Salmon Nigiri", ja: "サーモン握り" },
  "ماکی تن تند": { en: "Spicy Tuna Maki", ja: "スパイシーツナ巻き" },
  "دراگون رول ویژه شف": { en: "Chef's Dragon Roll", ja: "シェフのドラゴンロール" },
  "ساشیمی سالمون": { en: "Salmon Sashimi", ja: "サーモン刺身" },
  "تماکی سبزیجات": { en: "Veggie Temaki", ja: "野菜手巻き" },
  "نیگیری اوناگی": { en: "Unagi Nigiri", ja: "うなぎ握り" },
  "ویژه شف": { en: "Chef's Special", ja: "シェフのおすすめ" },
  "برنج سرکه‌ای": { en: "Vinegared rice", ja: "酢飯" },
  "سس تند": { en: "Spicy sauce", ja: "スパイシーソース" },
  "سس اوناگی": { en: "Unagi sauce", ja: "うなぎソース" },
  "تربچه ژاپنی": { en: "Daikon radish", ja: "大根" },
  "برگ شیسو": { en: "Shiso leaf", ja: "しその葉" },
  "مارماهی دودی": { en: "Smoked eel", ja: "蒲焼うなぎ" },
};

const WORDS: Record<string, TranslationPair> = {
  سلام: { en: "Hello", ja: "こんにちは" },
  خوشمزه: { en: "Delicious", ja: "おいしい" },
  تازه: { en: "Fresh", ja: "新鮮な" },
  محصول: { en: "Product", ja: "商品" },
  توضیحات: { en: "Description", ja: "説明" },
  با: { en: "with", ja: "と" },
  و: { en: "and", ja: "と" },
  در: { en: "in", ja: "で" },
  از: { en: "from", ja: "から" },
  برای: { en: "for", ja: "のために" },
  آووکادو: { en: "Avocado", ja: "アボカド" },
  اوناگی: { en: "Unagi", ja: "うなぎ" },
  برنج: { en: "Rice", ja: "ご飯" },
  تمپورا: { en: "Tempura", ja: "天ぷら" },
  تن: { en: "Tuna", ja: "ツナ" },
  تند: { en: "Spicy", ja: "スパイシー" },
  خیار: { en: "Cucumber", ja: "きゅうり" },
  دراگون: { en: "Dragon", ja: "ドラゴン" },
  رول: { en: "Roll", ja: "ロール" },
  سالمون: { en: "Salmon", ja: "サーモン" },
  ساشیمی: { en: "Sashimi", ja: "刺身" },
  سبزیجات: { en: "Veggie", ja: "野菜" },
  سرکه‌ای: { en: "Vinegared", ja: "酢" },
  سس: { en: "Sauce", ja: "ソース" },
  شف: { en: "Chef", ja: "シェフ" },
  ماکی: { en: "Maki", ja: "巻き寿司" },
  مارماهی: { en: "Eel", ja: "うなぎ" },
  میگو: { en: "Shrimp", ja: "エビ" },
  نیگیری: { en: "Nigiri", ja: "握り" },
  نوری: { en: "Nori", ja: "海苔" },
  هویج: { en: "Carrot", ja: "にんじん" },
  ویژه: { en: "Special", ja: "おすすめ" },
  وسابی: { en: "Wasabi", ja: "わさび" },
  کنجد: { en: "Sesame", ja: "ごま" },
};

const PERSIAN_TO_LATIN: Record<string, string> = {
  آ: "a",
  ا: "a",
  ب: "b",
  پ: "p",
  ت: "t",
  ث: "s",
  ج: "j",
  چ: "ch",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "z",
  ر: "r",
  ز: "z",
  ژ: "zh",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "z",
  ط: "t",
  ظ: "z",
  ع: "",
  غ: "gh",
  ف: "f",
  ق: "gh",
  ک: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  و: "v",
  ه: "h",
  ی: "y",
  ء: "",
};

function normalizePersian(value: string): string {
  return value
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}

export function transliteratePersian(value: string): string {
  return normalizePersian(value)
    .split("")
    .map((char) => PERSIAN_TO_LATIN[char] ?? (/[a-zA-Z0-9]/.test(char) ? char : char === " " ? " " : ""))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function latinToKatakana(value: string): string {
  const syllables: Record<string, string> = {
    kh: "ハ",
    gh: "ガ",
    sh: "シャ",
    ch: "チャ",
    zh: "ジャ",
    a: "ア",
    b: "ブ",
    c: "ク",
    d: "ド",
    e: "エ",
    f: "フ",
    g: "グ",
    h: "ハ",
    i: "イ",
    j: "ジ",
    k: "ク",
    l: "ル",
    m: "ム",
    n: "ン",
    o: "オ",
    p: "プ",
    q: "ク",
    r: "ル",
    s: "ス",
    t: "ト",
    u: "ウ",
    v: "ヴ",
    w: "ワ",
    x: "クス",
    y: "イ",
    z: "ズ",
  };

  let output = "";
  const clean = value.toLowerCase();
  for (let i = 0; i < clean.length; i += 1) {
    const pair = clean.slice(i, i + 2);
    if (syllables[pair]) {
      output += syllables[pair];
      i += 1;
      continue;
    }
    const char = clean[i];
    output += char === " " ? " " : syllables[char] ?? char;
  }
  return output.trim();
}

export function slugifyPersian(value: string): string {
  return transliteratePersian(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function translatePersianMenuText(value: string): TranslationPair {
  const normalized = normalizePersian(value);
  if (!normalized) return { en: "", ja: "" };

  const exact = PHRASES[normalized] ?? WORDS[normalized];
  if (exact) return exact;

  const tokens = normalized.split(/(\s+|،|,|\.|؛|:|\(|\)|-)/);
  const en = tokens
    .map((token) => {
      const word = WORDS[normalizePersian(token)];
      if (word) return word.en;
      return /[آ-ی]/.test(token) ? transliteratePersian(token) : token;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();

  const ja = tokens
    .map((token) => {
      const word = WORDS[normalizePersian(token)];
      if (word) return word.ja;
      return /[آ-ی]/.test(token) ? latinToKatakana(transliteratePersian(token)) : token;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();

  return { en, ja };
}

export function translatePersianList(items: string[]): TranslationPair {
  const translated = items.map(translatePersianMenuText);
  return {
    en: translated.map((item) => item.en).filter(Boolean).join(", "),
    ja: translated.map((item) => item.ja).filter(Boolean).join("、 "),
  };
}
