// src/lib/api.ts
import axios, { isAxiosError } from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * In dev: use VITE_API_URL or localhost.
 * In prod: ALWAYS use relative '/api' so Netlify proxy handles it.
 */
const isDev = import.meta.env.DEV
const baseURL = isDev
  ? (import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api')
  : '/api'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false, // set true only if you actually use cookies
})

// Minimal debug (safe for prod)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.log('API baseURL:', api.defaults.baseURL)
}

// --- Auth helpers ---
type AuthData = { token?: string; refreshToken?: string } & Record<string, any>
const AUTH_KEY = 'ire_admin_auth'

const getAuthData = (): AuthData | null => {
  try {
    const s = localStorage.getItem(AUTH_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

const setAuthData = (data: AuthData) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data))
}

const clearAuthData = () => {
  localStorage.removeItem(AUTH_KEY)
}

// Request: attach Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth = getAuthData()
    if (auth?.token) {
      // Axios v1: headers may be AxiosHeaders with .set()
      if (typeof config.headers?.set === 'function') {
        config.headers.set('Authorization', `Bearer ${auth.token}`)
      } else {
        // Fallback for plain object headers
        config.headers = {
          ...(config.headers ?? {}),
          Authorization: `Bearer ${auth.token}`,
        } as any
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response: refresh on 401 (one retry)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!isAxiosError(error)) return Promise.reject(error)

    const { response, config } = error
    const originalRequest: any = config

    if (response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true

      const auth = getAuthData()
      if (!auth?.refreshToken) {
        clearAuthData()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Use the same baseURL (goes through proxy in prod)
        const rr = await api.post('/auth/refresh', { refreshToken: auth.refreshToken })
        if (rr.data?.success) {
          const newAuth: AuthData = {
            ...auth,
            token: rr.data.data.token,
            refreshToken: rr.data.data.refreshToken,
          }
          setAuthData(newAuth)

          // Re-attach token to the retried request
          if (typeof originalRequest.headers?.set === 'function') {
            originalRequest.headers.set('Authorization', `Bearer ${newAuth.token}`)
          } else {
            originalRequest.headers = {
              ...(originalRequest.headers ?? {}),
              Authorization: `Bearer ${newAuth.token}`,
            }
          }

          return api(originalRequest)
        }
      } catch (e) {
        clearAuthData()
        window.location.href = '/login'
        return Promise.reject(e)
      }
    }

    return Promise.reject(error)
  }
)

// Normalized error for UI
export const normalizeError = (
  error: unknown
): { success: false; message: string; status?: number } => {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const message =
      (error.response?.data as any)?.message ??
      error.message ??
      (status ? `Request failed with status ${status}` : 'Network error')
    return { success: false, message, status }
  }
  if (error instanceof Error) return { success: false, message: error.message }
  if (typeof error === 'string') return { success: false, message: error }
  try {
    return { success: false, message: JSON.stringify(error) }
  } catch {
    return { success: false, message: 'Unknown error' }
  }
}

export { getAuthData, setAuthData, clearAuthData }
