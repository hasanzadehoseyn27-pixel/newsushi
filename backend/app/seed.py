"""
یک‌بار اجرا شود تا کاربر ادمین اولیه و چند دسته‌بندی/محصول نمونه ساخته شود.

    python -m app.seed
"""

import asyncio

from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine
from app.models.admin_user import AdminUser
from app.models.category import Category
from app.models.product import AnimationPreset, Product
from app.models.site_settings import AccentTheme, SiteSettings

settings = get_settings()

CATEGORIES = [
    {"slug": "nigiri", "name_fa": "نیگیری", "name_en": "Nigiri", "name_ja": "握り", "sort_order": 1},
    {"slug": "maki", "name_fa": "ماکی", "name_en": "Maki", "name_ja": "巻き寿司", "sort_order": 2},
    {"slug": "sashimi", "name_fa": "ساشیمی", "name_en": "Sashimi", "name_ja": "刺身", "sort_order": 3},
    {"slug": "temaki", "name_fa": "تماکی", "name_en": "Temaki", "name_ja": "手巻き", "sort_order": 4},
    {"slug": "special", "name_fa": "ویژه شف", "name_en": "Chef's Special", "name_ja": "シェフのおすすめ", "sort_order": 5},
]

PRODUCTS = [
    {
        "slug": "salmon-nigiri",
        "category_slug": "nigiri",
        "name_fa": "نیگیری سالمون", "name_en": "Salmon Nigiri", "name_ja": "サーモン握り",
        "ingredients_fa": ["سالمون تازه", "برنج سرکه‌ای", "وسابی"],
        "ingredients_en": ["Fresh salmon", "Vinegared rice", "Wasabi"],
        "ingredients_ja": ["新鮮なサーモン", "酢飯", "わさび"],
        "price_toman": 185000, "animation": AnimationPreset.FLOAT,
    },
    {
        "slug": "spicy-tuna-maki",
        "category_slug": "maki",
        "name_fa": "ماکی تن تند", "name_en": "Spicy Tuna Maki", "name_ja": "スパイシーツナ巻き",
        "ingredients_fa": ["تن", "سس تند", "خیار", "نوری"],
        "ingredients_en": ["Tuna", "Spicy sauce", "Cucumber", "Nori"],
        "ingredients_ja": ["ツナ", "スパイシーソース", "きゅうり", "海苔"],
        "price_toman": 220000, "is_spicy": True, "animation": AnimationPreset.WAVE,
    },
    {
        "slug": "chef-special-dragon",
        "category_slug": "special",
        "name_fa": "دراگون رول ویژه شف", "name_en": "Chef's Dragon Roll", "name_ja": "シェフのドラゴンロール",
        "ingredients_fa": ["میگو تمپورا", "آووکادو", "سس اوناگی", "کنجد"],
        "ingredients_en": ["Tempura shrimp", "Avocado", "Unagi sauce", "Sesame"],
        "ingredients_ja": ["エビ天ぷら", "アボカド", "うなぎソース", "ごま"],
        "price_toman": 340000, "animation": AnimationPreset.GLOW,
    },
    {
        "slug": "salmon-sashimi",
        "category_slug": "sashimi",
        "name_fa": "ساشیمی سالمون", "name_en": "Salmon Sashimi", "name_ja": "サーモン刺身",
        "ingredients_fa": ["سالمون", "تربچه ژاپنی", "برگ شیسو"],
        "ingredients_en": ["Salmon", "Daikon radish", "Shiso leaf"],
        "ingredients_ja": ["サーモン", "大根", "しその葉"],
        "price_toman": 260000, "animation": AnimationPreset.PETALS,
    },
    {
        "slug": "veggie-temaki",
        "category_slug": "temaki",
        "name_fa": "تماکی سبزیجات", "name_en": "Veggie Temaki", "name_ja": "野菜手巻き",
        "ingredients_fa": ["خیار", "آووکادو", "هویج", "نوری"],
        "ingredients_en": ["Cucumber", "Avocado", "Carrot", "Nori"],
        "ingredients_ja": ["きゅうり", "アボカド", "にんじん", "海苔"],
        "price_toman": 145000, "animation": AnimationPreset.STEAM,
    },
    {
        "slug": "eel-nigiri",
        "category_slug": "nigiri",
        "name_fa": "نیگیری اوناگی", "name_en": "Unagi Nigiri", "name_ja": "うなぎ握り",
        "ingredients_fa": ["مارماهی دودی", "برنج سرکه‌ای", "سس اوناگی"],
        "ingredients_en": ["Smoked eel", "Vinegared rice", "Unagi sauce"],
        "ingredients_ja": ["蒲焼うなぎ", "酢飯", "うなぎソース"],
        "price_toman": 210000, "animation": AnimationPreset.GLOW,
    },
]


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # --- admin user ---
        result = await db.execute(
            select(AdminUser).where(AdminUser.username == settings.SEED_ADMIN_USERNAME)
        )
        if not result.scalar_one_or_none():
            db.add(
                AdminUser(
                    username=settings.SEED_ADMIN_USERNAME,
                    hashed_password=hash_password(settings.SEED_ADMIN_PASSWORD),
                    is_superadmin=True,
                )
            )
            print(f"✅ ادمین ساخته شد: {settings.SEED_ADMIN_USERNAME}")
        else:
            print("ℹ️  ادمین از قبل وجود دارد، رد شد.")

        # --- site settings ---
        result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
        if not result.scalar_one_or_none():
            db.add(SiteSettings(id=1, accent_theme=AccentTheme.AKANE))

        await db.commit()

        # --- categories ---
        slug_to_id: dict[str, int] = {}
        for cat_data in CATEGORIES:
            result = await db.execute(
                select(Category).where(Category.slug == cat_data["slug"])
            )
            category = result.scalar_one_or_none()
            if not category:
                category = Category(**cat_data)
                db.add(category)
                await db.commit()
                await db.refresh(category)
                print(f"✅ دسته‌بندی ساخته شد: {cat_data['slug']}")
            slug_to_id[cat_data["slug"]] = category.id

        # --- products ---
        for prod_data in PRODUCTS:
            result = await db.execute(
                select(Product).where(Product.slug == prod_data["slug"])
            )
            if result.scalar_one_or_none():
                continue
            data = dict(prod_data)
            category_slug = data.pop("category_slug")
            data["category_id"] = slug_to_id[category_slug]
            db.add(Product(**data))
            print(f"✅ محصول ساخته شد: {prod_data['slug']}")

        await db.commit()

    print("\n🍣 seed کامل شد.")


if __name__ == "__main__":
    asyncio.run(seed())
