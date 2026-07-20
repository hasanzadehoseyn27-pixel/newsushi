import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fa", "en", "ja"],
  defaultLocale: "fa",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/products": {
      fa: "/mahsoolat",
      en: "/products",
      ja: "/products",
    },
    "/products/[slug]": {
      fa: "/mahsoolat/[slug]",
      en: "/products/[slug]",
      ja: "/products/[slug]",
    },
    "/cart": {
      fa: "/sabad-kharid",
      en: "/cart",
      ja: "/cart",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
