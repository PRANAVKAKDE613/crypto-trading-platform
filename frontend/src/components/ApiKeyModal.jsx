import { useState } from 'react'
import api from '../services/authService'

export default function ApiKeyModal({ onClose, onSuccess }) {
  const [apiKey, setApiKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)

      await api.post('/api-keys', {
        api_key: apiKey,
        secret_key: secretKey,
        exchange: 'binance',
      })

      alert('API Key added successfully')

      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      alert('Failed to add API key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>Add Binance API Key</h2>

        <input
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={input}
        />

        <input
          placeholder="Secret Key"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          style={input}
        />

        <button onClick={handleSubmit} style={btn}>
          {loading ? 'Saving...' : 'Save'}
        </button>

        <button onClick={onClose} style={cancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const modal = {
  background: '#1a1d27',
  padding: '24px',
  borderRadius: '10px',
  width: '300px',
}

const input = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
}

const btn = {
  width: '100%',
  padding: '10px',
  background: '#4f8ef7',
  color: '#fff',
}

const cancel = {
  marginTop: '10px',
  width: '100%',
}