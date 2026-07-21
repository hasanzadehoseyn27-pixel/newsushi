import asyncio
import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import get_current_admin
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/translate", tags=["translate"])


class TranslatePayload(BaseModel):
    text: str
    source: str = "fa"
    target: str


class TranslateOut(BaseModel):
    text: str


def _google_translate(text: str, source: str, target: str) -> str:
    query = urlencode(
        {
            "client": "gtx",
            "sl": source,
            "tl": target,
            "dt": "t",
            "q": text,
        }
    )
    req = Request(
        f"https://translate.googleapis.com/translate_a/single?{query}",
        headers={"User-Agent": "Mozilla/5.0"},
    )
    with urlopen(req, timeout=12) as response:
        payload = json.loads(response.read().decode("utf-8"))

    parts = payload[0] if payload and isinstance(payload[0], list) else []
    translated = "".join(part[0] for part in parts if part and isinstance(part[0], str))
    return translated.strip()


@router.post("", response_model=TranslateOut)
async def translate_text(
    payload: TranslatePayload,
    _: AdminUser = Depends(get_current_admin),
):
    text = payload.text.strip()
    if not text:
        return TranslateOut(text="")

    if payload.target not in {"en", "ja"}:
        raise HTTPException(status_code=400, detail="زبان مقصد پشتیبانی نمی‌شود")

    try:
        translated = await asyncio.to_thread(
            _google_translate,
            text,
            payload.source,
            payload.target,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="ترجمه گوگل در دسترس نیست") from exc

    return TranslateOut(text=translated)
