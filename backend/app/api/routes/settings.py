from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.site_settings import SiteSettings
from app.schemas.settings import SiteSettingsOut, SiteSettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


async def _get_or_create_settings(db: AsyncSession) -> SiteSettings:
    result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    settings_row = result.scalar_one_or_none()
    if not settings_row:
        settings_row = SiteSettings(id=1)
        db.add(settings_row)
        await db.commit()
        await db.refresh(settings_row)
    return settings_row


@router.get("", response_model=SiteSettingsOut)
async def get_settings_route(db: AsyncSession = Depends(get_db)):
    return await _get_or_create_settings(db)


@router.put("", response_model=SiteSettingsOut)
async def update_settings_route(
    payload: SiteSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    settings_row = await _get_or_create_settings(db)
    settings_row.accent_theme = payload.accent_theme
    await db.commit()
    await db.refresh(settings_row)
    return settings_row
