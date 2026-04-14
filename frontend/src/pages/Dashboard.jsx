import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { tradingService } from '../services/tradingService'
import ApiKeyModal from '../components/ApiKeyModal'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']

const Dashboard = () => {
  const [balances, setBalances] = useState([])
  const [prices, setPrices] = useState({})
  const [chartData, setChartData] = useState({})
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [balanceError, setBalanceError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchPrices = async () => {
    const newPrices = {}
    for (const symbol of SYMBOLS) {
      try {
        const data = await tradingService.getPrice(symbol)
        newPrices[symbol] = parseFloat(data.price)
      } catch (e) {}
    }
    setPrices(newPrices)

    const time = new Date().toLocaleTimeString()
    setChartData(prev => {
      const updated = { ...prev }
      for (const symbol of SYMBOLS) {
        if (!updated[symbol]) updated[symbol] = []
        if (newPrices[symbol]) {
          updated[symbol] = [
            ...updated[symbol].slice(-20),
            { time, price: newPrices[symbol] }
          ]
        }
      }
      return updated
    })
  }

  const fetchBalances = async () => {
    try {
      const data = await tradingService.getBalance()
      setBalances(data.balances || [])
      setBalanceError('')
    } catch (e) {
      setBalanceError('Add your Binance API key to see balances.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalances()
    fetchPrices()
    const interval = setInterval(fetchPrices, 5000)
    return () => clearInterval(interval)
  }, [])

  const usdtBalance = balances.find(b => b.asset === 'USDT')
  const totalWallet = usdtBalance ? parseFloat(usdtBalance.free) : 0

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Dashboard</h1>

        {/* Wallet */}
        <div style={styles.walletCard}>
          <div>
            <p style={styles.walletLabel}>Total Wallet Balance</p>
            <p style={styles.walletValue}>${totalWallet.toLocaleString()} USDT</p>

            {balanceError && (
              <div>
                <p style={styles.error}>{balanceError}</p>

                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  
                  {/* Binance link */}
                  <button
                    onClick={() =>
                      window.open(
                        'https://www.binance.com/en/my/settings/api-management',
                        '_blank'
                      )
                    }
                    style={styles.binanceBtn}
                  >
                    Create Binance API
                  </button>

                  {/* Modal trigger */}
                  <button
                    onClick={() => setShowModal(true)}
                    style={styles.addBtn}
                  >
                    Add API Key
                  </button>

                </div>
              </div>
            )}

            {loading && <p style={styles.muted}>Loading wallet...</p>}
          </div>

          <div style={styles.walletBadge}>Testnet</div>
        </div>

        {/* Ticker */}
        <div style={styles.ticker}>
          {SYMBOLS.map(symbol => (
            <div
              key={symbol}
              style={{
                ...styles.tickerItem,
                borderColor: selectedSymbol === symbol ? '#4f8ef7' : '#2a2d3a',
                background: selectedSymbol === symbol ? '#1e2235' : '#1a1d27',
              }}
              onClick={() => setSelectedSymbol(symbol)}
            >
              <span style={styles.tickerSymbol}>{symbol.replace('USDT', '')}</span>
              <span style={styles.tickerPrice}>
                ${prices[symbol] ? prices[symbol].toLocaleString() : '...'}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h2 style={styles.chartTitle}>{selectedSymbol} — Live Price</h2>
            <span style={styles.live}>● LIVE</span>
          </div>

          {chartData[selectedSymbol] && chartData[selectedSymbol].length > 1 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData[selectedSymbol]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="time" stroke="#a0a0b0" />
                <YAxis stroke="#a0a0b0" />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#4f8ef7" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.chartLoading}>Collecting live data...</div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <ApiKeyModal
            onClose={() => setShowModal(false)}
            onSuccess={fetchBalances}
          />
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  title: { fontSize: '28px', fontWeight: '700', marginBottom: '24px' },
  walletCard: {
    background: '#1a1d27',
    padding: '28px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  walletLabel: { color: '#aaa' },
  walletValue: { fontSize: '36px', fontWeight: '700' },
  walletBadge: { color: '#4f8ef7' },
  ticker: { display: 'flex', gap: '12px', marginBottom: '24px' },
  tickerItem: { flex: 1, padding: '16px', borderRadius: '10px', border: '1px solid' },
  tickerSymbol: { color: '#aaa' },
  tickerPrice: { color: '#4f8ef7' },
  chartCard: { background: '#1a1d27', padding: '24px', borderRadius: '12px' },
  chartHeader: { display: 'flex', justifyContent: 'space-between' },
  chartTitle: { fontSize: '18px' },
  live: { color: 'green' },
  chartLoading: { height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  error: { color: '#e74c3c' },
  muted: { color: '#aaa' },
  addBtn: {
    padding: '8px 16px',
    background: '#4f8ef7',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
  },
  binanceBtn: {
    padding: '8px 16px',
    background: '#f3ba2f',
    border: 'none',
    borderRadius: '6px',
    color: '#000',
    cursor: 'pointer',
    fontWeight: '600',
  },
}

export default Dashboard