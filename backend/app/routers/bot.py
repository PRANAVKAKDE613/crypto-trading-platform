from fastapi import APIRouter, HTTPException
from app.schemas.bot import BotConfig

router = APIRouter()

# Simple in-memory bot state
bot_state = {
    "is_running": False,
    "config": None
}


@router.post("/start")
async def start_bot(config: BotConfig):
    if bot_state["is_running"]:
        raise HTTPException(status_code=400, detail="Bot is already running.")

    # Validate config
    if config.upper_price <= config.lower_price:
        raise HTTPException(status_code=400, detail="Upper price must be greater than lower price.")
    if config.grid_levels < 2:
        raise HTTPException(status_code=400, detail="Minimum 2 grid levels required.")

    bot_state["is_running"] = True
    bot_state["config"] = config

    return {
        "message": f"Demo bot started for {config.symbol}",
        "status": bot_state
    }


@router.post("/stop")
async def stop_bot():
    if not bot_state["is_running"]:
        raise HTTPException(status_code=400, detail="Bot is not running.")

    bot_state["is_running"] = False

    return {
        "message": "Bot stopped",
        "status": bot_state
    }


@router.get("/status")
async def get_status():
    return bot_state