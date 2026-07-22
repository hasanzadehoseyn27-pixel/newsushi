import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import get_current_admin
from app.core.config import get_settings
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".webm"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".ogg"}
MAX_FILE_SIZE_MB = 8
MAX_AUDIO_SIZE_MB = 20
MAX_VIDEO_SIZE_MB = 150


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
):
    settings = get_settings()
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="فرمت تصویر پشتیبانی نمی‌شود")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="حجم تصویر بیش از حد مجاز است")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    (upload_dir / filename).write_bytes(contents)

    return {"url": f"/static/uploads/{filename}"}


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
):
    settings = get_settings()
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(status_code=400, detail="فرمت ویدیو پشتیبانی نمی‌شود")

    contents = await file.read()
    if len(contents) > MAX_VIDEO_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="حجم ویدیو بیش از حد مجاز است")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    (upload_dir / filename).write_bytes(contents)

    return {"url": f"/static/uploads/{filename}"}


@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
):
    settings = get_settings()
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(status_code=400, detail="فرمت صوت پشتیبانی نمی‌شود")

    contents = await file.read()
    if len(contents) > MAX_AUDIO_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="حجم صوت بیش از حد مجاز است")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    (upload_dir / filename).write_bytes(contents)

    return {"url": f"/static/uploads/{filename}"}
