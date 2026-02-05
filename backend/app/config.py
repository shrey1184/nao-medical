"""
Configuration management using Pydantic Settings.
Trade-off: Simple env-based config for MVP, can extend with config files later.
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/healthcare_translation"
    
    # Gemini API
    GEMINI_API_KEY: str = ""
    
    # App settings
    APP_NAME: str = "Healthcare Translation API"
    DEBUG: bool = False
    
    # CORS - for development, allow all. In production, restrict to your domain.
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string or JSON array."""
        origins = self.CORS_ORIGINS
        if origins.startswith("["):
            try:
                return json.loads(origins)
            except json.JSONDecodeError:
                pass
        return [o.strip() for o in origins.split(",") if o.strip()]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance to avoid re-reading env on every request."""
    return Settings()
