"""
اسکریپت انتقال محصولات/دسته‌بندی‌ها/تصاویر/توضیحات از ووکامرس به دیتابیس نیوسوشی.

قبل از اجرا:
  1) بک‌اند نیوسوشی باید روشن باشد (uvicorn روی پورت 8000).
  2) در ووکامرس یک کلید REST API بساز:
     WooCommerce > تنظیمات > پیشرفته > REST API > افزودن کلید
     دسترسی را روی "Read" بگذار، کافی است.
  3) مقادیر بخش CONFIG پایین را با اطلاعات خودت پر کن.
  4) این پکیج‌ها را (اگر نصب نیستند) در venv بک‌اند نصب کن:
       pip install requests

اجرا:
  cd backend
  .venv\\Scripts\\activate      (ویندوز)
  python -m scripts.migrate_from_woocommerce
"""

import html
import re
import sys
import time
from pathlib import Path

import requests

# ============================== CONFIG ==============================

# آدرس سایت وردپرس/ووکامرس (بدون اسلش انتهایی)
WC_URL = "https://sinisushi.com"

# از WooCommerce > تنظیمات > پیشرفته > REST API گرفته می‌شود
WC_CONSUMER_KEY = "ck_88040088d31b5ce64c72a3f0342c7c95d5078bc9"
WC_CONSUMER_SECRET = "cs_5a87768b7048827a7702dafb5030ceb699ecbcbe"

# آدرس بک‌اند نیوسوشی که الان روی سیستم خودت روشنه
NEWSUSHI_API = "http://localhost:8000"
ADMIN_USERNAME = "superadmin"
ADMIN_PASSWORD = "Admin123!"

# اگر قیمت‌های ووکامرس به تومان هستند 1 بگذار، اگر ریال هستند 0.1 بگذار
PRICE_MULTIPLIER = 1

# اگر True باشد، فقط چاپ می‌کند و چیزی در دیتابیس نمی‌سازد (برای تست اول)
DRY_RUN = True

# اگر می‌خواهی ترجمه انگلیسی/ژاپنی هم انجام شود True بگذار (کندتر است، هر متن چند ثانیه)
TRANSLATE = True

# =======================================================================


PERSIAN_TO_LATIN = {
    "آ": "a", "ا": "a", "ب": "b", "پ": "p", "ت": "t", "ث": "s", "ج": "j",
    "چ": "ch", "ح": "h", "خ": "kh", "د": "d", "ذ": "z", "ر": "r", "ز": "z",
    "ژ": "zh", "س": "s", "ش": "sh", "ص": "s", "ض": "z", "ط": "t", "ظ": "z",
    "ع": "", "غ": "gh", "ف": "f", "ق": "gh", "ک": "k", "گ": "g", "ل": "l",
    "م": "m", "ن": "n", "و": "v", "ه": "h", "ی": "y", "ء": "",
}


def transliterate_persian(value: str) -> str:
    value = value.replace("ي", "ی").replace("ك", "ک")
    return "".join(PERSIAN_TO_LATIN.get(ch, ch) for ch in value)


def strip_html(text: str) -> str:
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class NewSushiClient:
    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        res = self.session.post(
            f"{self.base_url}/api/auth/login",
            json={"username": username, "password": password},
            timeout=15,
        )
        res.raise_for_status()
        token = res.json()["access_token"]
        self.session.headers.update({"Authorization": f"Bearer {token}"})

    def list_categories(self):
        res = self.session.get(f"{self.base_url}/api/categories", timeout=15)
        res.raise_for_status()
        return res.json()

    def create_category(self, payload: dict):
        res = self.session.post(f"{self.base_url}/api/categories", json=payload, timeout=15)
        res.raise_for_status()
        return res.json()

    def list_products(self):
        res = self.session.get(f"{self.base_url}/api/products", timeout=15)
        res.raise_for_status()
        return res.json()

    def create_product(self, payload: dict):
        res = self.session.post(f"{self.base_url}/api/products", json=payload, timeout=30)
        if not res.ok:
            print("      خطای ساخت محصول:", res.status_code, res.text[:400])
        res.raise_for_status()
        return res.json()

    def upload_image_bytes(self, filename: str, content: bytes) -> str:
        files = {"file": (filename, content)}
        res = self.session.post(f"{self.base_url}/api/uploads/image", files=files, timeout=60)
        res.raise_for_status()
        return res.json()["url"]

    def translate(self, text: str, target: str) -> str:
        if not text.strip():
            return ""
        res = self.session.post(
            f"{self.base_url}/api/translate",
            json={"text": text, "source": "fa", "target": target},
            timeout=20,
        )
        if not res.ok:
            return ""
        return res.json().get("text", "")


class WooCommerceClient:
    def __init__(self, base_url: str, key: str, secret: str):
        self.base_url = base_url.rstrip("/")
        self.auth = (key, secret)

    def _paginate(self, path: str):
        page = 1
        while True:
            res = requests.get(
                f"{self.base_url}/wp-json/wc/v3/{path}",
                params={"per_page": 50, "page": page},
                auth=self.auth,
                timeout=30,
            )
            res.raise_for_status()
            batch = res.json()
            if not batch:
                break
            yield from batch
            page += 1

    def categories(self):
        return list(self._paginate("products/categories"))

    def products(self):
        return list(self._paginate("products"))


def build_slug(name_fa: str, name_en: str, fallback_id) -> str:
    """Always produce a clean, Latin, URL-safe slug (never url-encoded Persian)."""
    source = name_en.strip() if name_en and re.fullmatch(r"[\x00-\x7f\s\-]+", name_en.strip()) else ""
    if not source:
        source = transliterate_persian(name_fa)
    slug = re.sub(r"[^a-z0-9]+", "-", source.lower()).strip("-")
    return slug or f"item-{fallback_id}"


def make_unique(slug: str, used: set[str], fallback_id) -> str:
    if slug not in used:
        used.add(slug)
        return slug
    unique = f"{slug}-{fallback_id}"
    used.add(unique)
    return unique


def main():
    print("۱) اتصال به نیوسوشی (لاگین ادمین)...")
    try:
        newsushi = NewSushiClient(NEWSUSHI_API, ADMIN_USERNAME, ADMIN_PASSWORD)
    except Exception as exc:
        print("❌ اتصال به بک‌اند نیوسوشی ناموفق بود. مطمئن شو uvicorn روشن است.")
        print(exc)
        sys.exit(1)
    print("   ✅ متصل شد.")

    print("۲) اتصال به ووکامرس و گرفتن دسته‌بندی‌ها/محصولات...")
    woo = WooCommerceClient(WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET)
    try:
        wc_categories = woo.categories()
        wc_products = woo.products()
    except Exception as exc:
        print("❌ اتصال به ووکامرس ناموفق بود. کلید API و آدرس سایت را چک کن.")
        print(exc)
        sys.exit(1)
    print(f"   ✅ {len(wc_categories)} دسته‌بندی و {len(wc_products)} محصول از ووکامرس گرفته شد.")

    existing_categories = {c["slug"]: c for c in newsushi.list_categories()}
    existing_products = {p["slug"] for p in newsushi.list_products()}
    used_category_slugs = set(existing_categories.keys())
    used_product_slugs = set(existing_products)

    print("۳) ساخت دسته‌بندی‌ها در نیوسوشی...")
    category_id_by_wc_id: dict[int, int] = {}
    for index, cat in enumerate(wc_categories):
        if cat.get("count", 0) == 0 and cat.get("slug") != "uncategorized":
            # دسته‌بندی خالی (بدون محصول) را رد می‌کنیم تا شلوغ نشود
            pass

        base_slug = build_slug(cat["name"], "", cat["id"])
        name_fa = cat["name"]

        if base_slug in existing_categories:
            category_id_by_wc_id[cat["id"]] = existing_categories[base_slug]["id"]
            print(f"   ⏭️  دسته‌بندی «{name_fa}» از قبل موجود است، رد شد.")
            continue

        slug = make_unique(base_slug, used_category_slugs, cat["id"])

        name_en = newsushi.translate(name_fa, "en") if TRANSLATE else ""
        name_ja = newsushi.translate(name_fa, "ja") if TRANSLATE else ""

        payload = {
            "slug": slug,
            "name_fa": name_fa,
            "name_en": name_en or name_fa,
            "name_ja": name_ja or name_fa,
            "sort_order": index,
        }

        if DRY_RUN:
            print("   [DRY_RUN] ساخته می‌شد:", payload)
            continue

        created = newsushi.create_category(payload)
        category_id_by_wc_id[cat["id"]] = created["id"]
        existing_categories[slug] = created
        print(f"   ✅ دسته‌بندی ساخته شد: {name_fa} ({slug})")

    print("۴) ساخت محصولات در نیوسوشی...")
    for index, prod in enumerate(wc_products):
        name_fa_raw = html.unescape(prod["name"])
        base_slug = build_slug(name_fa_raw, "", prod["id"])

        if base_slug in existing_products:
            print(f"   ⏭️  محصول «{prod['name']}» از قبل موجود است، رد شد.")
            continue

        slug = make_unique(base_slug, used_product_slugs, prod["id"])

        wc_cats = prod.get("categories") or []
        category_id = None
        for wc_cat in wc_cats:
            category_id = category_id_by_wc_id.get(wc_cat["id"])
            if category_id:
                break
        if category_id is None:
            # اگر دسته‌بندی پیدا نشد، اولین دسته‌بندی موجود را می‌گذاریم تا ساخت محصول fail نشود
            fallback_cat = next(iter(existing_categories.values()), None)
            if not fallback_cat:
                print(f"   ⚠️  محصول «{prod['name']}» رد شد: هیچ دسته‌بندی‌ای در نیوسوشی موجود نیست.")
                continue
            category_id = fallback_cat["id"]

        name_fa = name_fa_raw
        description_fa = strip_html(prod.get("description") or prod.get("short_description") or "")

        price_raw = prod.get("regular_price") or prod.get("price") or "0"
        try:
            price_toman = int(float(price_raw) * PRICE_MULTIPLIER)
        except ValueError:
            price_toman = 0

        print(f"   ⏳ در حال پردازش «{name_fa}»...")

        images: list[str] = []
        if not DRY_RUN:
            for image_info in prod.get("images", [])[:6]:
                src = image_info.get("src")
                if not src:
                    continue
                try:
                    img_res = requests.get(src, timeout=30)
                    img_res.raise_for_status()
                    ext = Path(src.split("?")[0]).suffix.lower()
                    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
                        ext = ".jpg"
                    filename = f"woo-{prod['id']}-{len(images)}{ext}"
                    url = newsushi.upload_image_bytes(filename, img_res.content)
                    images.append(url)
                except Exception as exc:
                    print(f"      ⚠️  آپلود تصویر ناموفق ({src}): {exc}")

        name_en = newsushi.translate(name_fa, "en") if TRANSLATE else ""
        name_ja = newsushi.translate(name_fa, "ja") if TRANSLATE else ""
        description_en = newsushi.translate(description_fa, "en") if TRANSLATE and description_fa else ""
        description_ja = newsushi.translate(description_fa, "ja") if TRANSLATE and description_fa else ""

        payload = {
            "slug": slug,
            "category_id": category_id,
            "name_fa": name_fa,
            "name_en": name_en or name_fa,
            "name_ja": name_ja or name_fa,
            "description_fa": description_fa,
            "description_en": description_en,
            "description_ja": description_ja,
            "ingredients_fa": [],
            "ingredients_en": [],
            "ingredients_ja": [],
            "price_toman": price_toman,
            "is_spicy": False,
            "is_available": prod.get("stock_status", "instock") == "instock",
            "animation": "float",
            "images": images,
            "audio_url": "",
            "video_url": "",
            "sort_order": prod.get("menu_order", index),
        }

        if DRY_RUN:
            print("   [DRY_RUN] ساخته می‌شد:", {**payload, "images": f"{len(prod.get('images', []))} تصویر"})
            continue

        try:
            newsushi.create_product(payload)
            existing_products.add(slug)
            print(f"   ✅ محصول ساخته شد: {name_fa}")
        except Exception as exc:
            print(f"   ❌ ساخت محصول «{name_fa}» ناموفق بود: {exc}")

        time.sleep(0.2)  # کمی وقفه برای رعایت نرخ ترجمه گوگل

    print("\n🍣 انتقال کامل شد.")


if __name__ == "__main__":
    main()
