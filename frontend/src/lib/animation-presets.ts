import type { AnimationPreset } from "@/lib/types";

export const ANIMATION_PRESETS: { value: AnimationPreset; label: string; hint: string }[] = [
  { value: "float", label: "شناور (Float)", hint: "بالا می‌رود و کمی می‌چرخد" },
  { value: "steam", label: "بخار (Steam)", hint: "بخار ملایم از بالای محصول" },
  { value: "wave", label: "موج (Wave)", hint: "تکان چپ‌راست مثل موج" },
  { value: "glow", label: "درخشش (Glow)", hint: "هاله‌ی نور اطراف کارت" },
  { value: "petals", label: "گلبرگ (Petals)", hint: "چرخش ملایم به‌همراه بالا رفتن" },
];

export const ACCENT_LABELS: { value: string; label: string; hex: string }[] = [
  { value: "ai", label: "آی — نیلی", hex: "#2e5eaa" },
  { value: "wasabi", label: "واسابی — سبز", hex: "#4c7a3d" },
  { value: "akane", label: "آکانه — قرمز شیک", hex: "#b83228" },
  { value: "yuzu", label: "یوزو — طلایی", hex: "#c99423" },
  { value: "murasaki", label: "موراساکی — بنفش", hex: "#6a4c93" },
];
