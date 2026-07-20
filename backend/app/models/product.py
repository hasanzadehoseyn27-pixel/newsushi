import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class AnimationPreset(str, enum.Enum):
    """Named hover/reveal animation applied to a product card & its detail page."""

    FLOAT = "float"
    STEAM = "steam"
    WAVE = "wave"
    GLOW = "glow"
    PETALS = "petals"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)

    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    category: Mapped["Category"] = relationship(back_populates="products")

    name_fa: Mapped[str] = mapped_column(String(200))
    name_en: Mapped[str] = mapped_column(String(200))
    name_ja: Mapped[str] = mapped_column(String(200))

    description_fa: Mapped[str] = mapped_column(Text, default="")
    description_en: Mapped[str] = mapped_column(Text, default="")
    description_ja: Mapped[str] = mapped_column(Text, default="")

    # Each stored as a JSON array of strings, e.g. ["Fresh salmon", "Vinegared rice"]
    ingredients_fa: Mapped[list[str]] = mapped_column(JSON, default=list)
    ingredients_en: Mapped[list[str]] = mapped_column(JSON, default=list)
    ingredients_ja: Mapped[list[str]] = mapped_column(JSON, default=list)

    # Price stored as full Toman amount (no decimals).
    price_toman: Mapped[int] = mapped_column(Integer)

    is_spicy: Mapped[bool] = mapped_column(Boolean, default=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    animation: Mapped[AnimationPreset] = mapped_column(
        SAEnum(AnimationPreset, name="animation_preset"),
        default=AnimationPreset.FLOAT,
    )

    # JSON array of image URLs (first = cover image, rest = gallery/slider).
    images: Mapped[list[str]] = mapped_column(JSON, default=list)

    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
