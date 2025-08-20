import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, getAuthData, setAuthData, clearAuthData, normalizeError } from '@/lib/api'
import toast from 'react-hot-toast'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  isActive: boolean
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const authData = getAuthData()

      if (authData?.token) {
        setToken(authData.token)
        setRefreshToken(authData.refreshToken)

        try {
          // Verify token by calling /auth/me
          const response = await api.get('/auth/me')

          if (response.data.success) {
            setUser(response.data.data.user || response.data.data)
          } else {
            // Invalid token, clear auth
            clearAuthData()
          }
        } catch (error) {
          // Token invalid or expired, clear auth
          clearAuthData()
          setToken(null)
          setRefreshToken(null)
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/login', { email, password })

      if (response.data.success) {
        const {
          token: newToken,
          refreshToken: newRefreshToken,
          user: userData,
        } = response.data.data

        const authData = {
          token: newToken,
          refreshToken: newRefreshToken,
          user: userData,
        }

        setAuthData(authData)
        setToken(newToken)
        setRefreshToken(newRefreshToken)
        setUser(userData)

        toast.success('Login successful!')
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAuthData()
    setUser(null)
    setToken(null)
    setRefreshToken(null)
    toast.success('Logged out successfully')
  }

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
