from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import get_current_user
from app.agents.budget import convert_currency, get_all_rates

router = APIRouter(prefix="/budget", tags=["Budget"])

@router.get("/convert")
async def currency_convert(
    amount: float, from_currency: str, to_currency: str,
    current_user=Depends(get_current_user)
):
    return await convert_currency(amount, from_currency.upper(), to_currency.upper())

@router.get("/rates/{base}")
async def get_rates(base: str, current_user=Depends(get_current_user)):
    return await get_all_rates(base.upper())
