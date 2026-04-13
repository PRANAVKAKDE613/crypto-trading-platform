from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "CryptoTrader API"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "defaultsecret"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/cryptodb"
    REDIS_URL: str = "redis://localhost:6379"

    JWT_SECRET_KEY: str = "defaultjwtsecret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    FERNET_KEY: str = "defaultfernetkey"

    ALLOWED_ORIGINS: str = "*"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()