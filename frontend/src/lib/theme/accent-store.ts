import { create } from "zustand";

export const ACCENT_THEMES = ["ai", "wasabi", "akane", "yuzu", "murasaki"] as const;
export type AccentTheme = (typeof ACCENT_THEMES)[number];

export const ACCENT_LABELS: Record<AccentTheme, { fa: string; en: string; ja: string; hex: string }> = {
  ai: { fa: "آی (نیلی)", en: "Ai (Indigo)", ja: "藍", hex: "#2e5eaa" },
  wasabi: { fa: "واسابی (سبز)", en: "Wasabi (Green)", ja: "山葵", hex: "#4c7a3d" },
  akane: { fa: "آکانه (قرمز شیک)", en: "Akane (Soft Red)", ja: "茜", hex: "#b83228" },
  yuzu: { fa: "یوزو (طلایی)", en: "Yuzu (Gold)", ja: "柚子", hex: "#c99423" },
  murasaki: { fa: "موراساکی (بنفش)", en: "Murasaki (Purple)", ja: "紫", hex: "#6a4c93" },
};

interface AccentState {
  accent: AccentTheme;
  setAccent: (accent: AccentTheme) => void;
}

export const useAccentStore = create<AccentState>((set) => ({
  accent: "akane",
  setAccent: (accent) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-accent", accent);
      document.cookie = `accent=${accent}; path=/; max-age=31536000`;
    }
    set({ accent });
  },
}));
