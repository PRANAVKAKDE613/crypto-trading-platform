import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { tradingService } from '../services/tradingService'

const Portfolio = () => {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const data = await tradingService.getBalance()
        setBalances(data.balances || [])
      } catch (err) {
        setError('Could not load balances. Make sure your Binance API key is added.')
      } finally {
        setLoading(false)
      }
    }
    fetchBalances()
  }, [])

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Portfolio</h1>
        {loading && <p style={styles.muted}>Loading balances...</p>}
        {error && <div style={styles.error}>{error}</div>}
        {!loading && !error && (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span>Asset</span>
              <span>Free</span>
              <span>Locked</span>
            </div>
            {balances.length === 0 && <p style={styles.muted}>No balances found.</p>}
            {balances.map((b, i) => (
              <div key={i} style={styles.tableRow}>
                <span style={styles.asset}>{b.asset}</span>
                <span>{parseFloat(b.free).toFixed(6)}</span>
                <span style={styles.muted}>{parseFloat(b.locked).toFixed(6)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '32px' },
  title: { fontSize: '28px', fontWeight: '700', marginBottom: '24px' },
  error: { background: '#e74c3c22', color: '#e74c3c', padding: '12px', borderRadius: '6px', marginBottom: '16px' },
  muted: { color: '#a0a0b0', fontSize: '14px' },
  table: { background: '#1a1d27', borderRadius: '12px', border: '1px solid #2a2d3a', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '16px 24px', background: '#0f1117', color: '#a0a0b0', fontSize: '13px', fontWeight: '600' },
  tableRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '16px 24px', borderTop: '1px solid #2a2d3a', fontSize: '14px' },
  asset: { fontWeight: '600', color: '#4f8ef7' },
}

export default Portfolio