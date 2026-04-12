import api from './api'

export const authService = {
  async register(email, password) {
    const response = await api.post('/auth/register', { email, password })
    return response.data
  },

  async login(email, password) {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    localStorage.setItem('access_token', response.data.access_token)
    return response.data
  },

  logout() {
    localStorage.removeItem('access_token')
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token')
  },
}