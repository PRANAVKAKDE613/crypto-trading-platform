from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.api_key import ApiKey
from app.models.trade import Trade
from app.models.user import User
from app.routers.api_keys import get_current_user
from app.services.binance import BinanceService
from app.services.encryption import decrypt
from app.schemas.trading import PlaceOrderRequest

router = APIRouter()


async def get_binance_service(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> BinanceService:
    # Get user's API key from DB
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.user_id == current_user.id,
            ApiKey.exchange == "binance",
            ApiKey.is_active == True
        )
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Binance API key found. Please add your API key first."
        )

    # Decrypt keys and create service
    decrypted_key = decrypt(api_key.encrypted_api_key)
    decrypted_secret = decrypt(api_key.encrypted_secret)
    return BinanceService(decrypted_key, decrypted_secret, testnet=True)


@router.get("/balance")
async def get_balance(
    binance: BinanceService = Depends(get_binance_service)
):
    try:
        balances = binance.get_account_balance()
        return {"balances": balances}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/price/{symbol}")
async def get_price(
    symbol: str,
    binance: BinanceService = Depends(get_binance_service)
):
    try:
        price = binance.get_symbol_price(symbol.upper())
        return price
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/order")
async def place_order(
    data: PlaceOrderRequest,
    current_user: User = Depends(get_current_user),
    binance: BinanceService = Depends(get_binance_service),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Place order on Binance
        order = binance.place_order(
            symbol=data.symbol.upper(),
            side=data.side.upper(),
            quantity=data.quantity,
            order_type=data.order_type
        )

        # Save trade to DB
        trade = Trade(
            user_id=current_user.id,
            symbol=data.symbol.upper(),
            side=data.side.upper(),
            quantity=data.quantity,
            price=float(order.get("fills", [{}])[0].get("price", 0)),
            status=order.get("status", "UNKNOWN"),
            binance_order_id=str(order.get("orderId", ""))
        )
        db.add(trade)
        await db.commit()

        return {
            "message": "Order placed successfully",
            "order_id": order.get("orderId"),
            "status": order.get("status"),
            "symbol": data.symbol.upper(),
            "side": data.side.upper(),
            "quantity": data.quantity
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/orders")
async def get_open_orders(
    symbol: str = None,
    binance: BinanceService = Depends(get_binance_service)
):
    try:
        orders = binance.get_open_orders(symbol)
        return {"orders": orders}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/trades/{symbol}")
async def get_trade_history(
    symbol: str,
    binance: BinanceService = Depends(get_binance_service)
):
    try:
        trades = binance.get_trade_history(symbol.upper())
        return {"trades": trades}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))