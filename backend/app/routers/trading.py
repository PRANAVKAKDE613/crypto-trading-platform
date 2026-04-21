from fastapi import APIRouter, HTTPException
from app.services.crypto import CryptoService
from app.schemas.trading import PlaceOrderRequest

router = APIRouter()

service = CryptoService()


# ✅ Get balance (mock)
@router.get("/balance")
async def get_balance():
    return {"balances": service.get_account_balance()}


# ✅ Get price (REAL from CoinGecko)
@router.get("/price/{symbol}")
async def get_price(symbol: str):
    try:
        return service.get_symbol_price(symbol.upper())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ⚠️ Place order (mock)
@router.post("/order")
async def place_order(data: PlaceOrderRequest):
    return {
        "message": "Trading not supported (CoinGecko demo mode)",
        "symbol": data.symbol.upper(),
        "side": data.side.upper(),
        "quantity": data.quantity,
        "status": "SIMULATED"
    }


# ⚠️ Open orders (mock)
@router.get("/orders")
async def get_open_orders():
    return {"orders": []}


# ⚠️ Trade history (mock)
@router.get("/trades/{symbol}")
async def get_trade_history(symbol: str):
    return {"trades": []}