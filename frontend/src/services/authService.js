
import api from './auth'

export const authService = {
  login: async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    const response = await api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return response.data
  },

  register: async (email, password) => {
    const response = await api.post('/api/auth/register', { email, password })
    return response.data
  },
}