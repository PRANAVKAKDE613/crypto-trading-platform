import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const Navbar = () => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>CryptoTrader</div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/portfolio" style={styles.link}>Portfolio</Link>
        <Link to="/trading" style={styles.link}>Trading</Link>
        <Link to="/bot" style={styles.link}>Bot</Link>
        <button onClick={handleLogout} style={styles.btn}>Logout</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    background: '#1a1d27',
    borderBottom: '1px solid #2a2d3a',
  },
  brand: { fontSize: '20px', fontWeight: '700', color: '#4f8ef7' },
  links: { display: 'flex', gap: '24px', alignItems: 'center' },
  link: { color: '#a0a0b0', fontSize: '14px' },
  btn: {
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
}

export default Navbar