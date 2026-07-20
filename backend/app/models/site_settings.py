import enum
from datetime import datetime

from sqlalchemy import DateTime, Integer
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class AccentTheme(str, enum.Enum):
    AI = "ai"
    WASABI = "wasabi"
    AKANE = "akane"
    YUZU = "yuzu"
    MURASAKI = "murasaki"


class SiteSettings(Base):
    """Singleton row (id is always 1) holding the admin-controlled site-wide accent theme."""

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    accent_theme: Mapped[AccentTheme] = mapped_column(
        SAEnum(AccentTheme, name="accent_theme"), default=AccentTheme.AI
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
