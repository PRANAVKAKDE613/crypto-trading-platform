from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.api_key import ApiKey
from app.models.user import User
from app.routers.api_keys import get_current_user
from app.services.binance import BinanceService
from app.services.encryption import decrypt
from app.services.grid_bot import grid_bot
from app.schemas.bot import BotConfig

router = APIRouter()


async def get_binance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> BinanceService:
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.user_id == current_user.id,
            ApiKey.exchange == "binance",
            ApiKey.is_active == True
        )
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=404, detail="No Binance API key found.")
    return BinanceService(
        decrypt(api_key.encrypted_api_key),
        decrypt(api_key.encrypted_secret),
        testnet=True
    )


@router.post("/start")
async def start_bot(
    config: BotConfig,
    current_user: User = Depends(get_current_user),
    binance: BinanceService = Depends(get_binance)
):
    if grid_bot.is_running:
        raise HTTPException(status_code=400, detail="Bot is already running. Stop it first.")

    # Validate config
    if config.upper_price <= config.lower_price:
        raise HTTPException(status_code=400, detail="Upper price must be greater than lower price.")
    if config.grid_levels < 2:
        raise HTTPException(status_code=400, detail="Minimum 2 grid levels required.")

    grid_bot.configure(config, binance)
    grid_bot.start()
    return {"message": f"Bot started for {config.symbol}", "status": grid_bot.get_status()}


@router.post("/stop")
async def stop_bot(current_user: User = Depends(get_current_user)):
    if not grid_bot.is_running:
        raise HTTPException(status_code=400, detail="Bot is not running.")
    grid_bot.stop()
    return {"message": "Bot stopped", "status": grid_bot.get_status()}


@router.get("/status")
async def get_status(current_user: User = Depends(get_current_user)):
    return grid_bot.get_status()