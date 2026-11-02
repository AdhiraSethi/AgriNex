import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  iconBg?: string
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

export function StatCard({
  title, value, subtitle, icon: Icon,
  iconBg = 'bg-agri-100', iconColor = 'text-agri-700',
  trend, trendValue
}: StatCardProps) {
  return (
    <div className="stat-card animate-slide-up">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-display font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        {trend && trendValue && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
            trend === 'up' ? 'text-agri-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
             trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  )
}

interface BadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  active: 'badge-green',
  verified: 'badge-green',
  passed: 'badge-green',
  accepted: 'badge-green',
  released: 'badge-green',
  completed: 'badge-green',
  paid: 'badge-green',
  delivered: 'badge-green',
  pending: 'badge-yellow',
  forming: 'badge-yellow',
  consent_pending: 'badge-yellow',
  in_transit: 'badge-blue',
  pickup: 'badge-blue',
  confirmed: 'badge-blue',
  awarded: 'badge-blue',
  matching: 'badge-blue',
  open: 'badge-blue',
  pooled: 'badge-purple',
  held: 'badge-purple',
  partial: 'badge-yellow',
  rejected: 'badge-red',
  failed: 'badge-red',
  cancelled: 'badge-red',
  disputed: 'badge-red',
  expired: 'badge-gray',
}

export function StatusBadge({ status, className = '' }: BadgeProps) {
  const style = statusStyles[status] || 'badge-gray'
  const label = status.replace(/_/g, ' ')
  return (
    <span className={`badge ${style} ${className}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  )
}

interface LoadingProps {
  text?: string
}

export function LoadingSpinner({ text = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="spinner w-8 h-8" />
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  )
}

export function EmptyState({ title, description, icon: Icon }: {
  title: string; description?: string; icon?: React.ElementType
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-agri-50 rounded-2xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-agri-400" />
        </div>
      )}
      <p className="font-semibold text-gray-700">{title}</p>
      {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
    </div>
  )
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} animate-slide-up max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-display font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'bg-agri-500' : score >= 60 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{score}%</span>
      </div>
      <div className="score-bar">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
