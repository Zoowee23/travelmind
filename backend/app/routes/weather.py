from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user
from app.agents.weather import get_weather_forecast

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/{destination}")
async def weather(destination: str, current_user=Depends(get_current_user)):
    return await get_weather_forecast(destination)
