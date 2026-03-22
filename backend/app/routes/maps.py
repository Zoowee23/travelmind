import httpx
from fastapi import APIRouter, HTTPException, Query
from app.config import settings

router = APIRouter(prefix="/maps", tags=["maps"])

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


@router.get("/geocode")
async def geocode(destination: str = Query(...)):
    """Geocode a destination using OpenCage API."""
    api_key = settings.OPENCAGE_API_KEY
    if not api_key or api_key == "your_opencage_api_key_here":
        raise HTTPException(status_code=500, detail="OPENCAGE_API_KEY not configured")

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            "https://api.opencagedata.com/geocode/v1/json",
            params={"q": destination, "key": api_key, "limit": 1, "no_annotations": 1},
        )

    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Geocoding API error: {r.status_code} {r.text[:200]}")

    data = r.json()
    results = data.get("results", [])
    if not results:
        raise HTTPException(status_code=404, detail=f"Could not geocode '{destination}'")

    res = results[0]
    return {
        "lat": res["geometry"]["lat"],
        "lon": res["geometry"]["lng"],
        "display_name": res["formatted"],
    }


@router.get("/emergency")
async def emergency_services(lat: float = Query(...), lon: float = Query(...)):
    """Fetch nearby hospitals, pharmacies, and police stations via Overpass API."""
    radius = 5000  # 5 km

    query = f"""
[out:json][timeout:20];
(
  node[amenity=hospital](around:{radius},{lat},{lon});
  node[amenity=pharmacy](around:{radius},{lat},{lon});
  node[amenity=police](around:{radius},{lat},{lon});
  node[amenity=clinic](around:{radius},{lat},{lon});
);
out body;
"""

    async with httpx.AsyncClient(timeout=25) as client:
        r = await client.post(OVERPASS_URL, data={"data": query})

    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="Overpass API error")

    elements = r.json().get("elements", [])
    places = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name") or tags.get("name:en") or tags.get("amenity", "Unknown")
        amenity = tags.get("amenity", "unknown")
        elat, elon = el.get("lat"), el.get("lon")
        if not elat or not elon:
            continue
        phone = tags.get("phone") or tags.get("contact:phone") or tags.get("telephone") or None
        dist = round(((elat - lat) ** 2 + (elon - lon) ** 2) ** 0.5 * 111, 2)
        places.append({
            "name": name,
            "type": amenity,
            "lat": elat,
            "lon": elon,
            "phone": phone,
            "distance_km": dist,
        })

    places.sort(key=lambda x: x["distance_km"])
    return {"places": places[:30]}
