import { useState } from 'react'
import Navbar from '../components/Navbar'
import { tradingService } from '../services/tradingService'

const Trading = () => {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [side, setSide] = useState('BUY')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchPrice = async () => {
    try {
      const data = await tradingService.getPrice(symbol)
      setPrice(data.price)
    } catch (err) {
      setError('Could not fetch price')
    }
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const data = await tradingService.placeOrder(symbol, side, parseFloat(quantity))
      setMessage(`Order placed! ID: ${data.order_id} Status: ${data.status}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Trading</h1>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Price Check</h3>
            <div style={styles.row}>
              <input
                style={styles.input}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Symbol e.g. BTCUSDT"
              />
              <button style={styles.btnSecondary} onClick={fetchPrice}>Get Price</button>
            </div>
            {price && <p style={styles.price}>${parseFloat(price).toLocaleString()}</p>}
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Place Order</h3>
            {message && <div style={styles.success}>{message}</div>}
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleOrder}>
              <input
                style={styles.input}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Symbol e.g. BTCUSDT"
              />
              <div style={styles.row}>
                <button
                  type="button"
                  style={{ ...styles.sideBtn, background: side === 'BUY' ? '#2ecc71' : '#2a2d3a' }}
                  onClick={() => setSide('BUY')}
                >BUY</button>
                <button
                  type="button"
                  style={{ ...styles.sideBtn, background: side === 'SELL' ? '#e74c3c' : '#2a2d3a' }}
                  onClick={() => setSide('SELL')}
                >SELL</button>
              </div>
              <input
                style={styles.input}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
                required
              />
              <button style={styles.btn} type="submit" disabled={loading}>
                {loading ? 'Placing...' : `Place ${side} Order`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '32px' },
  title: { fontSize: '28px', fontWeight: '700', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  card: { background: '#1a1d27', padding: '24px', borderRadius: '12px', border: '1px solid #2a2d3a' },
  cardTitle: { color: '#a0a0b0', fontSize: '14px', marginBottom: '16px', fontWeight: '600' },
  row: { display: 'flex', gap: '12px', marginBottom: '12px' },
  input: { width: '100%', padding: '10px 12px', marginBottom: '12px', background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px' },
  btn: { width: '100%', padding: '12px', background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer', fontWeight: '600' },
  btnSecondary: { padding: '10px 16px', background: '#2a2d3a', color: '#e0e0e0', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' },
  sideBtn: { flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', color: '#fff' },
  price: { fontSize: '32px', fontWeight: '700', color: '#4f8ef7', marginTop: '12px' },
  success: { background: '#2ecc7122', color: '#2ecc71', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' },
  error: { background: '#e74c3c22', color: '#e74c3c', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' },
}

export default Trading