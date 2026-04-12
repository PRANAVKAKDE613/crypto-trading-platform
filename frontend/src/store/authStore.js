import { create } from 'zustand'

const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('access_token'),
  user: null,

  login: (token) => {
    localStorage.setItem('access_token', token)
    set({ isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    set({ isAuthenticated: false, user: null })
  },
}))

export default useAuthStore