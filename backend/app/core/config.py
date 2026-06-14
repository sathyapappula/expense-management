from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    APP_NAME: str = "Personal Finance Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/finance_db"

    SECRET_KEY: str = "change-this-secret-key-in-production-must-be-32-chars-min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def model_post_init(self, __context):
        if isinstance(self.CORS_ORIGINS, str):
            try:
                object.__setattr__(self, "CORS_ORIGINS", json.loads(self.CORS_ORIGINS))
            except Exception:
                object.__setattr__(self, "CORS_ORIGINS", [self.CORS_ORIGINS])


settings = Settings()
