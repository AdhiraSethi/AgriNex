import { create } from 'zustand'

export interface User {
  user_id: number
  name: string
  email: string
  role: 'farmer' | 'buyer' | 'transporter' | 'admin'
  kyc_status: string
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

// Load from localStorage on init
const savedUser = localStorage.getItem('agrinex_user')
const savedToken = localStorage.getItem('agrinex_token')

export const useAuthStore = create<AuthState>((set, get) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,

  setAuth: (user, token) => {
    localStorage.setItem('agrinex_user', JSON.stringify(user))
    localStorage.setItem('agrinex_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('agrinex_user')
    localStorage.removeItem('agrinex_token')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!get().token && !!get().user,
}))
