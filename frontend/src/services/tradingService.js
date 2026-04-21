import api from './api'

export const tradingService = {
  async getBalance() {
    const response = await api.get('/trading/balance')
    return response.data
  },

  async getPrice(symbol) {
    const response = await api.get(`/trading/price/${symbol}`)
    return response.data
  },

  async placeOrder(symbol, side, quantity) {
    const response = await api.post('/trading/order', {
      symbol,
      side,
      quantity,
      order_type: 'MARKET',
    })
    return response.data
  },

  async getTradeHistory(symbol) {
    const response = await api.get(`/trading/trades/${symbol}`)
    return response.data
  },

  async storeApiKey(apiKey, apiSecret) {
    const response = await api.post('/api-keys/', {
      api_key: apiKey,
      api_secret: apiSecret,
      exchange: 'coinBase',
    })
    return response.data
  },
}