import httpx
from app.config import settings

async def get_weather_forecast(destination: str) -> dict:
    # Current weather
    current_url = "https://api.openweathermap.org/data/2.5/weather"
    forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {"q": destination, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"}

    async with httpx.AsyncClient() as client:
        curr_resp = await client.get(current_url, params=params)
        if curr_resp.status_code != 200:
            raise Exception(f"City '{destination}' not found in OpenWeatherMap (status {curr_resp.status_code})")
        curr = curr_resp.json()

        fore_resp = await client.get(forecast_url, params={**params, "cnt": 40})
        fore_data = fore_resp.json() if fore_resp.status_code == 200 else {"list": []}

    # Current conditions (flat fields for the widget)
    current = {
        "temperature": round(curr["main"]["temp"], 1),
        "feels_like": round(curr["main"]["feels_like"], 1),
        "description": curr["weather"][0]["description"].capitalize(),
        "humidity": curr["main"]["humidity"],
        "wind_speed": curr["wind"]["speed"],
        "icon": curr["weather"][0]["icon"],
    }

    # 5-day daily forecast
    days = {}
    for item in fore_data.get("list", []):
        date = item["dt_txt"].split(" ")[0]
        if date not in days:
            days[date] = {"temps": [], "descriptions": [], "icons": []}
        days[date]["temps"].append(item["main"]["temp"])
        days[date]["descriptions"].append(item["weather"][0]["description"])
        days[date]["icons"].append(item["weather"][0]["icon"])

    forecast = []
    for date, info in days.items():
        avg_temp = round(sum(info["temps"]) / len(info["temps"]), 1)
        desc = max(set(info["descriptions"]), key=info["descriptions"].count)
        icon = max(set(info["icons"]), key=info["icons"].count)
        forecast.append({"date": date, "avg_temp_c": avg_temp, "condition": desc, "icon": icon})

    return {
        "destination": destination,
        **current,           # flat fields: temperature, description, humidity, wind_speed, etc.
        "forecast": forecast,
        "packing_suggestions": _packing_suggestions(forecast),
    }

def _packing_suggestions(forecast: list) -> list:
    items = ["Passport", "Travel insurance", "Phone charger", "Medications"]
    conditions = " ".join(f["condition"] for f in forecast).lower()
    temps = [f["avg_temp_c"] for f in forecast]
    avg = sum(temps) / len(temps) if temps else 20

    if avg < 10:
        items += ["Heavy jacket", "Thermal layers", "Gloves", "Scarf", "Boots"]
    elif avg < 20:
        items += ["Light jacket", "Sweater", "Jeans", "Comfortable shoes"]
    else:
        items += ["T-shirts", "Shorts", "Sunscreen", "Sunglasses", "Hat"]

    if "rain" in conditions or "drizzle" in conditions:
        items += ["Umbrella", "Waterproof jacket", "Waterproof shoes"]
    if "snow" in conditions:
        items += ["Snow boots", "Warm hat", "Hand warmers"]

    return list(set(items))
