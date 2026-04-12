import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { tradingService } from '../services/tradingService'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']

const Dashboard = () => {
  const [balances, setBalances] = useState([])
  const [prices, setPrices] = useState({})
  const [chartData, setChartData] = useState({})
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [balanceError, setBalanceError] = useState('')
  const [loading, setLoading] = useState(true)

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

        {/* Single Wallet Card */}
        <div style={styles.walletCard}>
          <div>
            <p style={styles.walletLabel}>Total Wallet Balance</p>
            <p style={styles.walletValue}>${totalWallet.toLocaleString()} USDT</p>
            {balanceError && <p style={styles.error}>{balanceError}</p>}
            {loading && <p style={styles.muted}>Loading wallet...</p>}
          </div>
          <div style={styles.walletBadge}>Testnet</div>
        </div>

        {/* 5 Currency Ticker */}
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

        {/* Live Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h2 style={styles.chartTitle}>{selectedSymbol} — Live Price</h2>
            <span style={styles.live}>● LIVE</span>
          </div>
          {chartData[selectedSymbol] && chartData[selectedSymbol].length > 1 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData[selectedSymbol]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="time" stroke="#a0a0b0" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#a0a0b0"
                  tick={{ fontSize: 11 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `$${v.toLocaleString()}`}
                  width={90}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: '8px' }}
                  labelStyle={{ color: '#a0a0b0' }}
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#4f8ef7"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.chartLoading}>
              Collecting live data... updates every 5 seconds
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  title: { fontSize: '28px', fontWeight: '700', marginBottom: '24px' },
  walletCard: {
    background: '#1a1d27',
    padding: '28px 32px',
    borderRadius: '12px',
    border: '1px solid #2a2d3a',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: { color: '#a0a0b0', fontSize: '14px', marginBottom: '8px' },
  walletValue: { fontSize: '36px', fontWeight: '700', color: '#fff' },
  walletBadge: {
    background: '#4f8ef722',
    color: '#4f8ef7',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  ticker: { display: 'flex', gap: '12px', marginBottom: '24px' },
  tickerItem: {
    flex: 1,
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  tickerSymbol: { fontSize: '12px', color: '#a0a0b0', display: 'block', marginBottom: '6px' },
  tickerPrice: { fontSize: '16px', fontWeight: '700', color: '#4f8ef7' },
  chartCard: {
    background: '#1a1d27',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #2a2d3a',
  },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  chartTitle: { fontSize: '18px', fontWeight: '600' },
  live: { color: '#2ecc71', fontSize: '13px', fontWeight: '600' },
  chartLoading: { height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0b0' },
  error: { color: '#e74c3c', fontSize: '13px', marginTop: '6px' },
  muted: { color: '#a0a0b0', fontSize: '13px', marginTop: '6px' },
}

export default Dashboard