from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app import models  # noqa: F401  (ensures all tables register on Base.metadata)
from app.api.routes import auth, categories, orders, products, settings as settings_routes
from app.api.routes import translate
from app.api.routes import upload
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables in development. In production, use `alembic upgrade head` instead.
    if settings.ENV == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await conn.execute(
                text("ALTER TABLE products ADD COLUMN IF NOT EXISTS audio_url VARCHAR(500) NOT NULL DEFAULT ''")
            )
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(settings_routes.router)
app.include_router(upload.router)
app.include_router(translate.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
