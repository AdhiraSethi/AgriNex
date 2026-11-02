import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import ThemeToggle from '../components/ThemeToggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const demoLogins = [
    { label: 'Farmer', email: 'suresh@agrinex.com', password: 'farmer123', color: 'bg-agri-100 text-agri-800' },
    { label: 'Buyer', email: 'buyer@agrinex.com', password: 'buyer123', color: 'bg-blue-100 text-blue-800' },
    { label: 'Transporter', email: 'transporter@agrinex.com', password: 'transport123', color: 'bg-orange-100 text-orange-800' },
    { label: 'Admin', email: 'admin@agrinex.com', password: 'admin123', color: 'bg-purple-100 text-purple-800' },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const { access_token, ...user } = response.data
      setAuth(user, access_token)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(`/${user.role}/dashboard`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)
      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      const { access_token, ...user } = response.data
      setAuth(user, access_token)
      toast.success(`Welcome, ${user.name}!`)
      navigate(`/${user.role}/dashboard`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-agri-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-agri-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-slide-up">
          {/* Logo */}
          <div className="flex items-start justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-agri rounded-2xl flex items-center justify-center shadow-agri">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-agri-800 text-xl">AgriNex</div>
                <div className="text-gray-400 text-xs">Sign in to your portal</div>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Demo Logins */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {demoLogins.map((d) => (
                <button
                  key={d.label}
                  onClick={() => quickLogin(d.email, d.password)}
                  disabled={loading}
                  className={`text-xs font-semibold py-2 px-3 rounded-lg ${d.color} hover:opacity-80 transition-opacity`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative text-center"><span className="bg-white px-3 text-xs text-gray-400">or sign in manually</span></div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@agrinex.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert-error flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <div className="spinner w-4 h-4" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to AgriNex?{' '}
            <Link to="/register" className="text-agri-700 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
