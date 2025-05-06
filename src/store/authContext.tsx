import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import type { User } from '../types/user'
import * as authService from '../services/auth'

interface AuthContextProps {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (params: { email: string; password: string }) => Promise<void>
  register: (params: { name: string; email: string; password: string }) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) return JSON.parse(storedUser)
    // If not in localStorage but token exists, fetch from backend
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      // This will be handled in useEffect below
      return null
    }
    return null
  })
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user from backend if token exists but no user in localStorage
  useEffect(() => {
    if (token && !user) fetchMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      const { token, user } = await authService.login({ email, password })
      setToken(token)
      setUser(user)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      // Immediately fetch the latest user info (avatarUrl) from backend
      try {
        const freshUser = await authService.fetchMe(token)
        setUser(freshUser)
        localStorage.setItem('user', JSON.stringify(freshUser))
      } catch (fetchErr) {
        // fallback: keep using user from login response
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      const { token, user } = await authService.register({ name, email, password })
      setToken(token)
      setUser(user)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchMe = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const user = await authService.fetchMe(token)
      setUser(user)
      localStorage.setItem('user', JSON.stringify(user))
    } catch (err: any) {
      setError(err.message)
      setUser(null)
      setToken(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setError(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
