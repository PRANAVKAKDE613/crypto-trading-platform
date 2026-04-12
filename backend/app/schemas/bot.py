from pydantic import BaseModel
from typing import Optional


class BotConfig(BaseModel):
    symbol: str                    # e.g. BTCUSDT
    upper_price: float             # upper grid limit
    lower_price: float             # lower grid limit
    grid_levels: int               # number of grids e.g. 10
    amount_per_grid: float         # USDT per grid e.g. 100
    profit_target: float           # stop bot when profit reaches this
    stop_loss: float               # stop bot when loss reaches this


class BotStatus(BaseModel):
    is_running: bool
    symbol: Optional[str]
    profit: float
    total_trades: int
    log: list