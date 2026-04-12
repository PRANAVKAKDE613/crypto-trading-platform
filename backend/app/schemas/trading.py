from pydantic import BaseModel
from typing import Optional


class PlaceOrderRequest(BaseModel):
    symbol: str          # e.g. BTCUSDT
    side: str            # BUY or SELL
    quantity: float
    order_type: str = "MARKET"


class OrderResponse(BaseModel):
    order_id: str
    symbol: str
    side: str
    quantity: float
    status: str