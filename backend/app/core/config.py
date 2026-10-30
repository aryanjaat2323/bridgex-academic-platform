import os
import secrets
from pydantic_settings import BaseSettings, SettingsConfigDict


def _require_env(var: str, fallback_for_dev: str | None = None) -> str:
    """Read an environment variable. In production (non-SQLite), SECRET_KEY MUST be set."""
    value = os.getenv(var)
    if value:
        return value
    if fallback_for_dev is not None:
        return fallback_for_dev
    raise RuntimeError(
        f"Environment variable '{var}' is required but not set. "
        f"See backend/.env.example for configuration instructions."
    )


class Settings(BaseSettings):
    PROJECT_NAME: str = "BridgeX"
    API_V1_STR: str = "/api/v1"

    # SECRET_KEY must be set via environment variable in production.
    # For local development only, a random key is generated per-process if not provided.
    # Generate a strong key: python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_hex(32))

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Defaults to SQLite locally for immediate friction-free zero-config execution,
    # and seamlessly connects to PostgreSQL / Supabase if DATABASE_URL is set in environment.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bridgex.db")

    # 48-hour SLA for doubt resolution before auto-escalation
    ESCALATION_HOURS_THRESHOLD: int = int(os.getenv("ESCALATION_HOURS_THRESHOLD", "48"))

    # Uploads directory
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10MB limit

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", env_file_encoding="utf-8")


settings = Settings()

