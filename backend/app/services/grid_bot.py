import asyncio
from typing import Optional
from app.services.crypto import CryptoService


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
        self.service = CryptoService()
        self._task: Optional[asyncio.Task] = None

    def configure(self, config):
        self.symbol = config.symbol
        self.upper_price = config.upper_price
        self.lower_price = config.lower_price
        self.grid_levels = config.grid_levels
        self.amount_per_grid = config.amount_per_grid
        self.profit_target = config.profit_target
        self.stop_loss = config.stop_loss

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
        self._add_log(f"Grid created from ${self.lower_price} to ${self.upper_price}")

    def _add_log(self, message: str):
        from datetime import datetime
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log = [f"[{timestamp}] {message}"] + self.log[:49]

    async def _run_loop(self):
        self._add_log(f"Bot started (SIMULATION) for {self.symbol}")

        while self.is_running:
            try:
                ticker = self.service.get_symbol_price(self.symbol)
                current_price = float(ticker["price"])

                self._add_log(f"Price: ${current_price}")

                # Profit stop
                if self.profit >= self.profit_target:
                    self._add_log("Profit target reached")
                    self.is_running = False
                    break

                # Stop loss
                if self.profit <= -self.stop_loss:
                    self._add_log("Stop loss hit")
                    self.is_running = False
                    break

                for i, grid_price in enumerate(self.grid_prices[:-1]):
                    next_price = self.grid_prices[i + 1]

                    # BUY (simulate)
                    if current_price <= grid_price and i not in self.bought_levels:
                        quantity = self.amount_per_grid / current_price

                        self.bought_levels[i] = {
                            "price": current_price,
                            "quantity": quantity
                        }

                        self.total_trades += 1
                        self._add_log(f"SIM BUY at ${current_price}")

                    # SELL (simulate)
                    elif current_price >= next_price and i in self.bought_levels:
                        buy = self.bought_levels[i]
                        profit = (current_price - buy["price"]) * buy["quantity"]

                        self.profit += profit
                        self.total_trades += 1
                        del self.bought_levels[i]

                        self._add_log(f"SIM SELL at ${current_price} | Profit: {profit:.4f}")

                await asyncio.sleep(10)

            except Exception as e:
                self._add_log(f"Error: {str(e)}")
                await asyncio.sleep(10)

        self._add_log("Bot stopped")

    def start(self):
        if not self.is_running:
            self.is_running = True
            self._task = asyncio.create_task(self._run_loop())

    def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()

    def get_status(self):
        return {
            "is_running": self.is_running,
            "profit": round(self.profit, 4),
            "total_trades": self.total_trades,
            "log": self.log[:20],
            "grid_prices": self.grid_prices,
        }


grid_bot = GridBot()