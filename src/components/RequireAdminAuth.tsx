import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAdminAuthenticated } from '../lib/auth'

export default function RequireAdminAuth() {
  const location = useLocation()
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
