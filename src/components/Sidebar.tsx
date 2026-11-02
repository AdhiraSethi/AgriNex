import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard, Sprout, Users, ShoppingCart, Truck,
  Shield, LogOut, Leaf, FileText, CreditCard, Package,
  BarChart3, CheckCircle, Gavel, Fingerprint
} from 'lucide-react'

const farmerNav = [
  { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/farmer/listings', icon: Sprout, label: 'My Crop Listings' },
  { to: '/farmer/kyc', icon: Fingerprint, label: 'KYC Verification' },
  { to: '/farmer/invitations', icon: Users, label: 'Pool Invitations' },
  { to: '/farmer/payments', icon: CreditCard, label: 'Payments' },
]

const buyerNav = [
  { to: '/buyer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/buyer/procurement', icon: FileText, label: 'Procurement' },
  { to: '/buyer/pools', icon: Package, label: 'Crop Pools' },
  { to: '/buyer/orders', icon: ShoppingCart, label: 'Order Tracking' },
]

const transporterNav = [
  { to: '/transporter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transporter/jobs', icon: Truck, label: 'Available Jobs' },
  { to: '/transporter/auctions', icon: Gavel, label: 'Auctions' },
  { to: '/transporter/my-bids', icon: FileText, label: 'My Bids' },
  { to: '/transporter/shipments', icon: Package, label: 'My Shipments' },
]

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'User Verification' },
  { to: '/admin/pools', icon: Package, label: 'Crop Pools' },
  { to: '/admin/auctions', icon: Gavel, label: 'Transport Auctions' },
  { to: '/admin/shipments', icon: Truck, label: 'Shipments' },
  { to: '/admin/inspections', icon: CheckCircle, label: 'Inspections' },
  { to: '/admin/escrow', icon: Shield, label: 'Escrow & Payments' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

const roleConfig: Record<string, { nav: typeof farmerNav; color: string; label: string; icon: React.ElementType }> = {
  farmer: { nav: farmerNav, color: 'from-agri-900 via-agri-800 to-agri-700', label: 'Farmer Portal', icon: Sprout },
  buyer: { nav: buyerNav, color: 'from-blue-900 via-blue-800 to-blue-700', label: 'Buyer Portal', icon: ShoppingCart },
  transporter: { nav: transporterNav, color: 'from-orange-900 via-orange-800 to-orange-700', label: 'Transporter Portal', icon: Truck },
  admin: { nav: adminNav, color: 'from-purple-900 via-purple-800 to-purple-700', label: 'Admin Portal', icon: Shield },
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  if (!user) return null

  const config = roleConfig[user.role] || roleConfig.farmer
  const NavIcon = config.icon

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={`sidebar bg-gradient-to-b ${config.color}`}>
      {/* Logo */}
      <div className="sidebar-brand flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="font-display font-bold text-white text-lg leading-tight">AgriNex</div>
          <div className="text-white/60 text-xs">{config.label}</div>
        </div>
      </div>

      {/* User Info */}
      <div className="sidebar-user px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <NavIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-sm truncate">{user.name}</div>
            <div className="text-white/60 text-xs capitalize">{user.role}</div>
          </div>
          {user.kyc_status === 'verified' && (
            <CheckCircle className="w-4 h-4 text-agri-300 shrink-0" />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 py-4 overflow-y-auto">
        <div className="space-y-1">
          {config.nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                isActive ? 'nav-item-active' : 'nav-item'
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="sidebar-footer p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
