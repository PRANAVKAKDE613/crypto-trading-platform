import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.register(email, password)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.sub}>Start trading crypto today</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#1a1d27', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #2a2d3a' },
  title: { fontSize: '24px', fontWeight: '700', marginBottom: '8px' },
  sub: { color: '#a0a0b0', marginBottom: '24px' },
  error: { background: '#e74c3c22', color: '#e74c3c', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: '6px', color: '#e0e0e0', fontSize: '14px', display: 'block' },
  btn: { width: '100%', padding: '12px', background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' },
  footer: { textAlign: 'center', marginTop: '20px', color: '#a0a0b0', fontSize: '14px' },
  link: { color: '#4f8ef7' },
}

export default Register