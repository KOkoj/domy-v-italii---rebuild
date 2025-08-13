import axios, { AxiosError, AxiosResponse } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: any
}

export interface ApiError {
  success: false
  message: string
  error?: any
}

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper to get auth data from localStorage
const getAuthData = () => {
  try {
    const authData = localStorage.getItem('ire_admin_auth')
    return authData ? JSON.parse(authData) : null
  } catch {
    return null
  }
}

// Helper to set auth data in localStorage
const setAuthData = (data: any) => {
  localStorage.setItem('ire_admin_auth', JSON.stringify(data))
}

// Helper to clear auth data
const clearAuthData = () => {
  localStorage.removeItem('ire_admin_auth')
}

// Request interceptor to attach Authorization header
api.interceptors.request.use(
  (config) => {
    const authData = getAuthData()
    if (authData?.token) {
      config.headers.Authorization = `Bearer ${authData.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const authData = getAuthData()
      if (authData?.refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: authData.refreshToken,
          })

          if (response.data.success) {
            const newAuthData = {
              ...authData,
              token: response.data.data.token,
              refreshToken: response.data.data.refreshToken,
            }
            setAuthData(newAuthData)

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          clearAuthData()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, clear auth and redirect to login
        clearAuthData()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Helper function to normalize API errors
export const normalizeError = (error: any): ApiError => {
  if (error.response?.data) {
    return {
      success: false,
      message: error.response.data.message || 'An error occurred',
      error: error.response.data.error,
    }
  }

  if (error.message) {
    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: false,
    message: 'An unexpected error occurred',
  }
}

// Export auth helpers
export { getAuthData, setAuthData, clearAuthData }
