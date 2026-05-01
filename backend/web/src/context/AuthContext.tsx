/**
 * AuthContext — global authentication state management.
 * Persists tokens in localStorage and auto-loads user on mount.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, type User } from '../api/endpoints'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, password2: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ─── On mount, try to restore session ──────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('token')
      if (!token) { setIsLoading(false); return }
      try {
        const res = await authApi.me()
        setUser(res.data)
      } catch {
        // Token expired / invalid — clear storage
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (
    username: string, email: string, password: string, password2: string
  ) => {
    const res = await authApi.register(username, email, password, password2)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
