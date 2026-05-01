import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * A wrapper component that redirects to /login if user is not authenticated.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show nothing (or a loader) while checking auth status
  if (isLoading) {
    return null
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
