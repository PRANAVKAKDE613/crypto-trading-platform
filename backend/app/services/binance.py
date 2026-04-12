from binance.client import Client
from binance.exceptions import BinanceAPIException
from typing import Optional


class BinanceService:
    def __init__(self, api_key: str, api_secret: str, testnet: bool = True):
        self.client = Client(api_key, api_secret, testnet=testnet)

    def get_account_balance(self) -> list:
        try:
            account = self.client.get_account()
            # Return only non-zero balances
            balances = [
                b for b in account["balances"]
                if float(b["free"]) > 0 or float(b["locked"]) > 0
            ]
            return balances
        except BinanceAPIException as e:
            raise Exception(f"Binance error: {e.message}")

    def get_symbol_price(self, symbol: str) -> dict:
        try:
            ticker = self.client.get_symbol_ticker(symbol=symbol)
            return ticker
        except BinanceAPIException as e:
            raise Exception(f"Binance error: {e.message}")

    def place_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        order_type: str = "MARKET"
    ) -> dict:
        try:
            if side.upper() == "BUY":
                order = self.client.order_market_buy(
                    symbol=symbol,
                    quantity=quantity
                )
            else:
                order = self.client.order_market_sell(
                    symbol=symbol,
                    quantity=quantity
                )
            return order
        except BinanceAPIException as e:
            raise Exception(f"Binance error: {e.message}")

    def get_open_orders(self, symbol: Optional[str] = None) -> list:
        try:
            if symbol:
                return self.client.get_open_orders(symbol=symbol)
            return self.client.get_open_orders()
        except BinanceAPIException as e:
            raise Exception(f"Binance error: {e.message}")

    def get_trade_history(self, symbol: str) -> list:
        try:
            return self.client.get_my_trades(symbol=symbol)
        except BinanceAPIException as e:
            raise Exception(f"Binance error: {e.message}")

    def cancel_order(self, symbol: str, order_id: int) -> dict:
        try:
            return self.client.cancel_order(symbol=symbol, orderId=order_id)
        except BinanceAPIException as e:
            raise Exception(f"Binance error: {e.message}")