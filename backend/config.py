import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexo Sinérgico"
    PROJECT_VERSION: str = "2.5.0"

    # Base de Datos
    # Si no hay variable (ej. local sin docker), usa SQLite como fallback
    # FIX: Use absolute path to avoid confusion between root and backend folder
    DATABASE_URL: str = "sqlite:///../nexo.db"

    # Seguridad JWT
    SECRET_KEY: str = "super_secreto_fallback_inseguro_para_dev"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # AI
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = "../.env"
        env_file_encoding = 'utf-8'
        extra = "ignore"

# Instancia global
settings = Settings()
