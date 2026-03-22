import httpx

async def convert_currency(amount: float, from_currency: str, to_currency: str) -> dict:
    if from_currency == to_currency:
        return {"amount": amount, "from": from_currency, "to": to_currency, "converted": amount, "rate": 1.0}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.frankfurter.app/latest",
                params={"from": from_currency, "to": to_currency},
                timeout=8,
            )
            resp.raise_for_status()
            data = resp.json()
        rate = data["rates"][to_currency]
        return {"amount": amount, "from": from_currency, "to": to_currency,
                "converted": round(amount * rate, 2), "rate": rate}
    except Exception as e:
        raise Exception(f"Currency conversion failed: {e}")


async def get_all_rates(base: str) -> dict:
    """Get all exchange rates from a base currency."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.frankfurter.app/latest",
                params={"from": base},
                timeout=8,
            )
            resp.raise_for_status()
            data = resp.json()
        return {"base": base, "rates": data["rates"], "date": data.get("date")}
    except Exception as e:
        raise Exception(f"Failed to fetch rates: {e}")
