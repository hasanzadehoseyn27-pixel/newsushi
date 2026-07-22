from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.product import AnimationPreset


class ProductBase(BaseModel):
    slug: str
    category_id: int

    name_fa: str
    name_en: str
    name_ja: str

    description_fa: str = ""
    description_en: str = ""
    description_ja: str = ""

    ingredients_fa: list[str] = []
    ingredients_en: list[str] = []
    ingredients_ja: list[str] = []

    price_toman: int
    is_spicy: bool = False
    is_available: bool = True
    animation: AnimationPreset = AnimationPreset.FLOAT
    images: list[str] = []
    audio_url: str = ""
    video_url: str = ""
    sort_order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    slug: str | None = None
    category_id: int | None = None
    name_fa: str | None = None
    name_en: str | None = None
    name_ja: str | None = None
    description_fa: str | None = None
    description_en: str | None = None
    description_ja: str | None = None
    ingredients_fa: list[str] | None = None
    ingredients_en: list[str] | None = None
    ingredients_ja: list[str] | None = None
    price_toman: int | None = None
    is_spicy: bool | None = None
    is_available: bool | None = None
    animation: AnimationPreset | None = None
    images: list[str] | None = None
    audio_url: str | None = None
    video_url: str | None = None
    sort_order: int | None = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
