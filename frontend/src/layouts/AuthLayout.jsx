import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useIsMobile } from '../hooks/useIsMobile'

export default function AuthLayout() {
  const { isAuthenticated } = useAuth()
  const isMobile = useIsMobile()
  if (isAuthenticated) return <Navigate to="/" replace />

  if (isMobile) {
    return (
      <div className="auth-mobile-shell">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="auth-desktop-shell">
      <Outlet />
    </div>
  )
}
