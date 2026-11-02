import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, AlertCircle, Sprout, ShoppingCart, Truck, Shield } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import ThemeToggle from '../components/ThemeToggle'

const roles = [
  { value: 'farmer', label: 'Farmer', desc: 'List crops, join pools', icon: Sprout, color: 'border-agri-500 bg-agri-50' },
  { value: 'buyer', label: 'Buyer', desc: 'Procure crops', icon: ShoppingCart, color: 'border-blue-500 bg-blue-50' },
  { value: 'transporter', label: 'Transporter', desc: 'Bid on transport jobs', icon: Truck, color: 'border-orange-500 bg-orange-50' },
  { value: 'admin', label: 'Admin', desc: 'Manage platform', icon: Shield, color: 'border-purple-500 bg-purple-50' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'farmer',
    location: '', district: '', state: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/register', form)
      const { access_token, ...user } = response.data
      setAuth(user, access_token)
      toast.success('Account created! Welcome to AgriNex.')
      navigate(`/${user.role}/dashboard`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-agri-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-agri-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-slide-up">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-agri rounded-2xl flex items-center justify-center shadow-agri">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-display font-bold text-agri-800 text-xl">Join AgriNex</div>
                <div className="text-gray-400 text-xs">Create your account</div>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map(({ value, label, desc, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: value }))}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      form.role === value ? color + ' border-current' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${form.role === value ? '' : 'text-gray-400'}`} />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Full Name</label>
                <input id="name" type="text" value={form.name} onChange={set('name')} className="input-field" placeholder="Suresh Patil" required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input id="phone" type="tel" value={form.phone} onChange={set('phone')} className="input-field" placeholder="9800000000" required />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input id="email" type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="label">Password</label>
              <input id="password" type="password" value={form.password} onChange={set('password')} className="input-field" placeholder="Min 6 characters" minLength={6} required />
            </div>

            {form.role === 'farmer' && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">Location</label>
                  <input type="text" value={form.location} onChange={set('location')} className="input-field" placeholder="Village" />
                </div>
                <div>
                  <label className="label">District</label>
                  <input type="text" value={form.district} onChange={set('district')} className="input-field" placeholder="Nashik" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input type="text" value={form.state} onChange={set('state')} className="input-field" placeholder="Maharashtra" />
                </div>
              </div>
            )}

            {error && (
              <div className="alert-error flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button id="register-btn" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="spinner w-4 h-4" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-agri-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
