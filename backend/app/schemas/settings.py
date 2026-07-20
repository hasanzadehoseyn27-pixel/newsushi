from pydantic import BaseModel, ConfigDict

from app.models.site_settings import AccentTheme


class SiteSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    accent_theme: AccentTheme


class SiteSettingsUpdate(BaseModel):
    accent_theme: AccentTheme
