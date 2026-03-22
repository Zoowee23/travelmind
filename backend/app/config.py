from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GROK_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    OPENCAGE_API_KEY: str = ""

    # Email (Gmail SMTP with App Password)
    EMAIL_ADDRESS: str = ""
    EMAIL_APP_PASSWORD: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
