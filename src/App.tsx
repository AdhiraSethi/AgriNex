import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PortalPage from './pages/PortalPage'
import ProtectedLayout from './components/ProtectedLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/farmer" element={<ProtectedLayout requiredRole="farmer" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<PortalPage />} />
        </Route>
        <Route path="/buyer" element={<ProtectedLayout requiredRole="buyer" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<PortalPage />} />
        </Route>
        <Route path="/transporter" element={<ProtectedLayout requiredRole="transporter" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<PortalPage />} />
        </Route>
        <Route path="/admin" element={<ProtectedLayout requiredRole="admin" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<PortalPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App