import asyncio
from typing import Optional
from app.services.binance import BinanceService


class GridBot:
    def __init__(self):
        self.is_running = False
        self.symbol = None
        self.upper_price = 0
        self.lower_price = 0
        self.grid_levels = 0
        self.amount_per_grid = 0
        self.profit_target = 0
        self.stop_loss = 0
        self.profit = 0.0
        self.total_trades = 0
        self.log = []
        self.grid_prices = []
        self.bought_levels = {}
        self.binance: Optional[BinanceService] = None
        self._task: Optional[asyncio.Task] = None

    def configure(self, config, binance_service: BinanceService):
        self.symbol = config.symbol
        self.upper_price = config.upper_price
        self.lower_price = config.lower_price
        self.grid_levels = config.grid_levels
        self.amount_per_grid = config.amount_per_grid
        self.profit_target = config.profit_target
        self.stop_loss = config.stop_loss
        self.binance = binance_service
        self.profit = 0.0
        self.total_trades = 0
        self.log = []
        self.bought_levels = {}
        self._calculate_grid()

    def _calculate_grid(self):
        step = (self.upper_price - self.lower_price) / self.grid_levels
        self.grid_prices = [
            round(self.lower_price + i * step, 2)
            for i in range(self.grid_levels + 1)
        ]
        self._add_log(f"Grid created | {len(self.grid_prices)} levels | ${self.lower_price} to ${self.upper_price}")

    def _add_log(self, message: str):
        from datetime import datetime
        timestamp = datetime.now().strftime("%H:%M:%S")
        entry = f"[{timestamp}] {message}"
        self.log = [entry] + self.log[:49]

    def _check_wallet(self) -> bool:
        try:
            balances = self.binance.get_account_balance()
            usdt = next((b for b in balances if b['asset'] == 'USDT'), None)
            if not usdt:
                self._add_log("No USDT balance found in wallet")
                return False
            available = float(usdt['free'])
            required = self.amount_per_grid
            if available < required:
                self._add_log(f"Insufficient balance | Available: ${available:.2f} | Required: ${required:.2f}")
                return False
            self._add_log(f"Wallet OK | Available: ${available:.2f} USDT")
            return True
        except Exception as e:
            self._add_log(f"Wallet check error: {str(e)}")
            return False

    async def _run_loop(self):
        self._add_log(f"Bot started | Trading {self.symbol} | Profit target: ${self.profit_target} | Stop loss: ${self.stop_loss}")
        while self.is_running:
            try:
                # Get current price
                ticker = self.binance.get_symbol_price(self.symbol)
                current_price = float(ticker['price'])
                self._add_log(f"Scanning market | {self.symbol} price: ${current_price:,.2f} | Total profit: ${self.profit:.2f}")

                # Check profit target
                if self.profit >= self.profit_target:
                    self._add_log(f"Profit target reached! | Total profit: ${self.profit:.2f} | Bot stopping...")
                    self.is_running = False
                    break

                # Check stop loss
                if self.profit <= -self.stop_loss:
                    self._add_log(f"Stop loss triggered! | Total loss: ${abs(self.profit):.2f} | Bot stopping...")
                    self.is_running = False
                    break

                # Check if price is out of grid range
                if current_price > self.upper_price or current_price < self.lower_price:
                    self._add_log(f"Price ${current_price:,.2f} is outside grid range (${self.lower_price} - ${self.upper_price}) | Waiting...")
                    await asyncio.sleep(30)
                    continue

                # Grid trading logic
                for i, grid_price in enumerate(self.grid_prices[:-1]):
                    next_price = self.grid_prices[i + 1]

                    # BUY condition
                    if current_price <= grid_price and not self.bought_levels.get(i):
                        if self._check_wallet():
                            try:
                                quantity = round(self.amount_per_grid / current_price, 6)
                                self.binance.place_order(self.symbol, 'BUY', quantity)
                                self.bought_levels[i] = {
                                    'price': current_price,
                                    'quantity': quantity
                                }
                                self.total_trades += 1
                                self._add_log(
                                    f"BUY executed | {quantity} {self.symbol} "
                                    f"at ${current_price:,.2f} | "
                                    f"Grid level {i+1} | "
                                    f"Cost: ${self.amount_per_grid:.2f} USDT"
                                )
                            except Exception as e:
                                self._add_log(f"BUY failed at level {i+1} | Error: {str(e)}")

                    # SELL condition
                    elif current_price >= next_price and self.bought_levels.get(i):
                        try:
                            buy_info = self.bought_levels[i]
                            quantity = buy_info['quantity']
                            self.binance.place_order(self.symbol, 'SELL', quantity)
                            trade_profit = (current_price - buy_info['price']) * quantity
                            self.profit += trade_profit
                            self.total_trades += 1
                            del self.bought_levels[i]
                            self._add_log(
                                f"SELL executed | {quantity} {self.symbol} "
                                f"at ${current_price:,.2f} | "
                                f"Bought at ${buy_info['price']:,.2f} | "
                                f"Trade profit: +${trade_profit:.4f} | "
                                f"Total profit: ${self.profit:.4f}"
                            )
                        except Exception as e:
                            self._add_log(f"SELL failed at level {i+1} | Error: {str(e)}")

                await asyncio.sleep(10)

            except Exception as e:
                self._add_log(f"Bot error: {str(e)}")
                await asyncio.sleep(10)

        self._add_log("Bot stopped.")

    def start(self):
        if not self.is_running:
            self.is_running = True
            self._task = asyncio.create_task(self._run_loop())

    def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()
        self._add_log("Bot manually stopped by user.")

    def get_status(self) -> dict:
        return {
            "is_running": self.is_running,
            "symbol": self.symbol,
            "profit": round(self.profit, 4),
            "total_trades": self.total_trades,
            "log": self.log[:20],
            "grid_prices": self.grid_prices,
            "bought_levels": len(self.bought_levels),
            "profit_target": self.profit_target,
            "stop_loss": self.stop_loss,
        }


# Global bot instance
grid_bot = GridBot()