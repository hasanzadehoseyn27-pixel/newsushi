from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "NewSushi API"
    ENV: str = "development"

    # postgresql+asyncpg://user:password@host:5432/dbname
    DATABASE_URL: str = "postgresql+asyncpg://newsushi:newsushi@localhost:5432/newsushi"

    JWT_SECRET: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12  # 12h

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3311",
    ]

    # Used only by the one-time seed script, not read at request time.
    SEED_ADMIN_USERNAME: str = "superadmin"
    SEED_ADMIN_PASSWORD: str = "Admin123!"

    UPLOAD_DIR: str = "static/uploads"


@lru_cache
def get_settings() -> Settings:
    return Settings()
