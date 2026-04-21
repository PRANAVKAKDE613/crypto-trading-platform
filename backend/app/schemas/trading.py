from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.crypto import CryptoService

router = APIRouter()


# ===== Schemas (your existing ones) =====
class PlaceOrderRequest(BaseModel):
    symbol: str
    side: str
    quantity: float
    order_type: str = "MARKET"


class OrderResponse(BaseModel):
    order_id: str
    symbol: str
    side: str
    quantity: float
    status: str


# ===== Routes =====

# ✅ Get price
@router.get("/price/{symbol}")
def get_price(symbol: str):
    service = CryptoService()
    return service.get_symbol_price(symbol)


# ✅ Get balance (mocked)
@router.get("/balance")
def get_balance():
    service = CryptoService()
    return {"balances": service.get_account_balance()}


# ⚠️ Place order (mock)
@router.post("/order")
def place_order(request: PlaceOrderRequest):
    service = CryptoService()
    return service.place_order(
        request.symbol,
        request.side,
        request.quantity,
        request.order_type
    )


# ⚠️ Open orders (mock)
@router.get("/orders")
def get_orders(symbol: Optional[str] = None):
    service = CryptoService()
    return service.get_open_orders(symbol)


# ⚠️ Trade history (mock)
@router.get("/trades/{symbol}")
def get_trades(symbol: str):
    service = CryptoService()
    return service.get_trade_history(symbol)


# ⚠️ Cancel order (mock)
@router.delete("/order/{symbol}/{order_id}")
def cancel_order(symbol: str, order_id: int):
    service = CryptoService()
    return service.cancel_order(symbol, order_id)