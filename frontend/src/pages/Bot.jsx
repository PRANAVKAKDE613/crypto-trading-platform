import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const CURRENCIES = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'XRPUSDT', name: 'XRP' },
]

const DEFAULT_CONFIG = {
  symbol: 'BTCUSDT',
  upper_price: '',
  lower_price: '',
  grid_levels: 10,
  amount_per_grid: 100,
  profit_target: 50,
  stop_loss: 30,
}

const Bot = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [currentPrice, setCurrentPrice] = useState(null)
  const logRef = useRef(null)

  const fetchStatus = async () => {
    try {
      const res = await api.get('/bot/status')
      setStatus(res.data)
    } catch (e) {}
  }

  const fetchPrice = async (symbol) => {
    try {
      const res = await api.get(`/trading/price/${symbol}`)
      setCurrentPrice(parseFloat(res.data.price))
    } catch (e) {}
  }

  useEffect(() => {
    fetchStatus()
    fetchPrice(config.symbol)
    const interval = setInterval(() => {
      fetchStatus()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchPrice(config.symbol)
  }, [config.symbol])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0
    }
  }, [status?.log])

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value })
  }

  const handleStart = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await api.post('/bot/start', {
        ...config,
        upper_price: parseFloat(config.upper_price),
        lower_price: parseFloat(config.lower_price),
        grid_levels: parseInt(config.grid_levels),
        amount_per_grid: parseFloat(config.amount_per_grid),
        profit_target: parseFloat(config.profit_target),
        stop_loss: parseFloat(config.stop_loss),
      })
      setMessage(res.data.message)
      fetchStatus()
    } catch (e) {
      const detail = e.response?.data?.detail
setError(typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Failed to start bot')
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await api.post('/bot/stop')
      setMessage(res.data.message)
      fetchStatus()
    } catch (e) {
      const detail = e.response?.data?.detail
setError(typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Failed to stop bot')
    } finally {
      setLoading(false)
    }
  }

  const autoFillGrid = () => {
    if (!currentPrice) return
    const upper = (currentPrice * 1.05).toFixed(2)
    const lower = (currentPrice * 0.95).toFixed(2)
    setConfig({ ...config, upper_price: upper, lower_price: lower })
  }

  const isRunning = status?.is_running

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Grid Trading Bot</h1>

        <div style={styles.grid}>

          {/* Left — Config Panel */}
          <div>
            {/* Status Card */}
            <div style={{
              ...styles.statusCard,
              borderColor: isRunning ? '#2ecc71' : '#2a2d3a',
              background: isRunning ? '#1a2d1a' : '#1a1d27',
            }}>
              <div style={styles.statusRow}>
                <span style={styles.statusDot(isRunning)}></span>
                <span style={styles.statusText}>
                  {isRunning ? `Running — ${status?.symbol}` : 'Bot Stopped'}
                </span>
              </div>
              {isRunning && (
                <div style={styles.statsRow}>
                  <div style={styles.stat}>
                    <p style={styles.statLabel}>Profit</p>
                    <p style={{
                      ...styles.statValue,
                      color: status?.profit >= 0 ? '#2ecc71' : '#e74c3c'
                    }}>
                      ${status?.profit?.toFixed(2)}
                    </p>
                  </div>
                  <div style={styles.stat}>
                    <p style={styles.statLabel}>Trades</p>
                    <p style={styles.statValue}>{status?.total_trades}</p>
                  </div>
                  <div style={styles.stat}>
                    <p style={styles.statLabel}>Open Grids</p>
                    <p style={styles.statValue}>{status?.bought_levels}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Config Form */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Bot Configuration</h3>

              {error && <div style={styles.error}>{error}</div>}
              {message && <div style={styles.success}>{message}</div>}

              {/* Currency Select */}
              <label style={styles.label}>Select Currency</label>
              <select
                name="symbol"
                value={config.symbol}
                onChange={handleChange}
                style={styles.select}
                disabled={isRunning}
              >
                {CURRENCIES.map(c => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>

              {/* Current Price */}
              {currentPrice && (
                <div style={styles.priceRow}>
                  <span style={styles.priceLabel}>Current Price:</span>
                  <span style={styles.priceValue}>${currentPrice.toLocaleString()}</span>
                  <button style={styles.autoBtn} onClick={autoFillGrid} disabled={isRunning}>
                    Auto Fill Grid
                  </button>
                </div>
              )}

              {/* Price Range */}
              <div style={styles.row}>
                <div style={styles.half}>
                  <label style={styles.label}>Upper Price ($)</label>
                  <input
                    style={styles.input}
                    name="upper_price"
                    type="number"
                    value={config.upper_price}
                    onChange={handleChange}
                    placeholder="e.g. 75000"
                    disabled={isRunning}
                  />
                </div>
                <div style={styles.half}>
                  <label style={styles.label}>Lower Price ($)</label>
                  <input
                    style={styles.input}
                    name="lower_price"
                    type="number"
                    value={config.lower_price}
                    onChange={handleChange}
                    placeholder="e.g. 68000"
                    disabled={isRunning}
                  />
                </div>
              </div>

              {/* Grid Settings */}
              <div style={styles.row}>
                <div style={styles.half}>
                  <label style={styles.label}>Grid Levels</label>
                  <input
                    style={styles.input}
                    name="grid_levels"
                    type="number"
                    value={config.grid_levels}
                    onChange={handleChange}
                    disabled={isRunning}
                  />
                </div>
                <div style={styles.half}>
                  <label style={styles.label}>Amount Per Grid (USDT)</label>
                  <input
                    style={styles.input}
                    name="amount_per_grid"
                    type="number"
                    value={config.amount_per_grid}
                    onChange={handleChange}
                    disabled={isRunning}
                  />
                </div>
              </div>

              {/* Profit/Loss Targets */}
              <div style={styles.row}>
                <div style={styles.half}>
                  <label style={styles.label}>Profit Target (USDT)</label>
                  <input
                    style={styles.input}
                    name="profit_target"
                    type="number"
                    value={config.profit_target}
                    onChange={handleChange}
                    disabled={isRunning}
                  />
                </div>
                <div style={styles.half}>
                  <label style={styles.label}>Stop Loss (USDT)</label>
                  <input
                    style={styles.input}
                    name="stop_loss"
                    type="number"
                    value={config.stop_loss}
                    onChange={handleChange}
                    disabled={isRunning}
                  />
                </div>
              </div>

              {/* Buttons */}
              {!isRunning ? (
                <button
                  style={styles.startBtn}
                  onClick={handleStart}
                  disabled={loading}
                >
                  {loading ? 'Starting...' : 'Start Bot'}
                </button>
              ) : (
                <button
                  style={styles.stopBtn}
                  onClick={handleStop}
                  disabled={loading}
                >
                  {loading ? 'Stopping...' : 'Stop Bot'}
                </button>
              )}
            </div>
          </div>

          {/* Right — Logs */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Bot Logs</h3>
            <div style={styles.logBox} ref={logRef}>
              {!status?.log?.length && (
                <p style={styles.muted}>No logs yet. Start the bot to see activity.</p>
              )}
              {status?.log?.map((entry, i) => (
                <div key={i} style={{
                  ...styles.logEntry,
                  color: entry.includes('BUY') ? '#2ecc71'
                    : entry.includes('SELL') ? '#e74c3c'
                    : entry.includes('error') || entry.includes('Error') ? '#e74c3c'
                    : entry.includes('profit') || entry.includes('Profit') ? '#f1c40f'
                    : '#a0a0b0'
                }}>
                  {entry}
                </div>
              ))}
            </div>

            {/* Grid Levels Info */}
            {status?.grid_prices?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={styles.cardTitle}>Grid Levels</h4>
                <div style={styles.gridLevels}>
                  {status.grid_prices.slice().reverse().map((price, i) => (
                    <div key={i} style={styles.gridLevel}>
                      <span style={styles.muted}>Level {status.grid_prices.length - i}</span>
                      <span>${price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  title: { fontSize: '28px', fontWeight: '700', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  card: { background: '#1a1d27', padding: '24px', borderRadius: '12px', border: '1px solid #2a2d3a', marginBottom: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#e0e0e0' },
  statusCard: { padding: '20px', borderRadius: '12px', border: '1px solid', marginBottom: '16px', transition: 'all .3s' },
  statusRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  statusDot: (on) => ({
    width: '10px', height: '10px', borderRadius: '50%',
    background: on ? '#2ecc71' : '#555',
    boxShadow: on ? '0 0 8px #2ecc71' : 'none',
  }),
  statusText: { fontSize: '15px', fontWeight: '600' },
  statsRow: { display: 'flex', gap: '24px', marginTop: '16px' },
  stat: {},
  statLabel: { color: '#a0a0b0', fontSize: '12px', marginBottom: '4px' },
  statValue: { fontSize: '20px', fontWeight: '700' },
  label: { display: 'block', color: '#a0a0b0', fontSize: '12px', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px', marginBottom: '12px' },
  select: { width: '100%', padding: '10px 12px', background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px', marginBottom: '12px' },
  row: { display: 'flex', gap: '12px' },
  half: { flex: 1 },
  priceRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', background: '#0f1117', padding: '10px 12px', borderRadius: '6px' },
  priceLabel: { color: '#a0a0b0', fontSize: '13px' },
  priceValue: { color: '#4f8ef7', fontWeight: '700', fontSize: '16px', flex: 1 },
  autoBtn: { padding: '6px 12px', background: '#2a2d3a', color: '#e0e0e0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  startBtn: { width: '100%', padding: '14px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
  stopBtn: { width: '100%', padding: '14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
  error: { background: '#e74c3c22', color: '#e74c3c', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' },
  success: { background: '#2ecc7122', color: '#2ecc71', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' },
  logBox: { background: '#0f1117', borderRadius: '8px', padding: '12px', height: '300px', overflowY: 'auto', fontFamily: 'monospace' },
  logEntry: { fontSize: '12px', padding: '3px 0', borderBottom: '1px solid #1a1d27' },
  muted: { color: '#a0a0b0', fontSize: '13px' },
  gridLevels: { background: '#0f1117', borderRadius: '8px', padding: '12px', maxHeight: '200px', overflowY: 'auto' },
  gridLevel: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', borderBottom: '1px solid #1a1d27' },
}

export default Bot