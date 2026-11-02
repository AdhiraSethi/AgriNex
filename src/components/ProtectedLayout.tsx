import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

interface ProtectedLayoutProps {
  requiredRole?: string
}

export default function ProtectedLayout({ requiredRole }: ProtectedLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to their own portal
    return <Navigate to={`/${user?.role}/dashboard`} replace />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="page-wrapper flex-1">
        <Outlet />
      </main>
      <Toaster position="top-right" toastOptions={{
        className: 'font-sans text-sm',
        success: { iconTheme: { primary: '#2d6a4f', secondary: 'white' } }
      }} />
    </div>
  )
}
