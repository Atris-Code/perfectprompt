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
    # IMPORTANTE: sobrescribir en producción con una clave fuerte (ver .env.example)
    SECRET_KEY: str = "super_secreto_fallback_inseguro_para_dev"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS — orígenes permitidos (separados por coma).
    # NO usar "*" junto con allow_credentials=True.
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://188.166.19.103"

    # --- Proveedor de IA (Nexo Sinérgico) ---
    # OpenAI es el proveedor principal; Claude es el fallback (texto/visión).
    # Las claves viven SOLO en el servidor. Nunca se exponen al navegador.
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"

    # --- Credenciales semilla (SOLO desarrollo) ---
    # En producción, sobrescribir por variables de entorno (NEXO_* / DEMO_*).
    DEMO_EMAIL: str = "cientifico@nexo.com"
    DEMO_PASSWORD: str = "ciencia123"
    ADMIN_EMAIL: str = "admin@nexo.com"
    ADMIN_PASSWORD: str = "admin123"

    class Config:
        env_file = "../.env"
        env_file_encoding = 'utf-8'
        extra = "ignore"

# Instancia global
settings = Settings()
