import { useSelector } from 'react-redux'

export function useAuth() {
  const { user, token, loading } = useSelector((state) => state.auth)
  return { user, token, isAuthenticated: !!token, loading }
}
