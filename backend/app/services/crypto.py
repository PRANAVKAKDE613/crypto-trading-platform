import requests
from typing import Optional


class CryptoService:
    BASE_URL = "https://api.coingecko.com/api/v3"

    # Map your frontend symbols → CoinGecko IDs
    SYMBOL_MAP = {
        "BTCUSDT": "bitcoin",
        "ETHUSDT": "ethereum",
        "BNBUSDT": "binancecoin",
        "SOLUSDT": "solana",
        "XRPUSDT": "ripple",
    }

    def __init__(self):
        pass

    # ✅ Get price
    def get_symbol_price(self, symbol: str) -> dict:
        try:
            coin_id = self.SYMBOL_MAP.get(symbol)

            if not coin_id:
                raise Exception("Unsupported symbol")

            url = f"{self.BASE_URL}/simple/price"
            params = {
                "ids": coin_id,
                "vs_currencies": "usd"
            }

            response = requests.get(url, params=params)
            data = response.json()

            return {
                "symbol": symbol,
                "price": data[coin_id]["usd"]
            }

        except Exception as e:
            raise Exception(f"CoinGecko error: {str(e)}")

    # ⚠️ Fake balance (since CoinGecko doesn't support wallets)
    def get_account_balance(self) -> list:
        return [
            {"asset": "USDT", "free": "1000", "locked": "0"},
            {"asset": "BTC", "free": "0.01", "locked": "0"},
            {"asset": "ETH", "free": "0.2", "locked": "0"},
        ]

    # ❌ Not supported (placeholder)
    def place_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        order_type: str = "MARKET"
    ) -> dict:
        return {"message": "Trading not supported with CoinGecko"}

    def get_open_orders(self, symbol: Optional[str] = None) -> list:
        return []

    def get_trade_history(self, symbol: str) -> list:
        return []

    def cancel_order(self, symbol: str, order_id: int) -> dict:
        return {"message": "Cancel not supported"}