from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    slug: str
    name_fa: str
    name_en: str
    name_ja: str
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    slug: str | None = None
    name_fa: str | None = None
    name_en: str | None = None
    name_ja: str | None = None
    sort_order: int | None = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
