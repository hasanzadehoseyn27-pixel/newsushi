import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsushi.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: `${SITE_URL}${getPathname({ locale, href: "/" })}`,
      changeFrequency: "daily",
      priority: 1,
    });
    entries.push({
      url: `${SITE_URL}${getPathname({ locale, href: "/cart" })}`,
      changeFrequency: "monthly",
      priority: 0.3,
    });

    for (const product of products) {
      entries.push({
        url: `${SITE_URL}${getPathname({
          locale,
          href: { pathname: "/products/[slug]", params: { slug: product.slug } },
        })}`,
        lastModified: product.updated_at,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
