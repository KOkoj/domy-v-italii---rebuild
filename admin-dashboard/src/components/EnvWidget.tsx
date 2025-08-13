import React, { useState, useEffect, useCallback } from 'react'
import { clsx } from 'clsx'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface HealthStatus {
  api: 'online' | 'offline' | 'error'
  health: 'online' | 'offline' | 'error'
}

export const EnvWidget: React.FC = () => {
  const [status, setStatus] = useState<HealthStatus>({
    api: 'offline',
    health: 'offline',
  })
  const [, setLastCheck] = useState<Date | null>(null)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  const baseUrl = apiUrl.replace('/api', '')

  const checkStatus = useCallback(async () => {
    const newStatus: HealthStatus = {
      api: 'offline',
      health: 'offline',
    }

    try {
      // Check base API endpoint
      const apiResponse = await axios.get(`${baseUrl}`, { timeout: 5000 })
      newStatus.api = apiResponse.status === 200 ? 'online' : 'error'
    } catch {
      newStatus.api = 'offline'
    }

    try {
      // Check health endpoint
      const healthResponse = await axios.get(`${apiUrl}/health`, { timeout: 5000 })
      newStatus.health = healthResponse.status === 200 ? 'online' : 'error'
    } catch {
      newStatus.health = 'offline'
    }

    setStatus(newStatus)
    setLastCheck(new Date())
  }, [apiUrl, baseUrl])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [checkStatus])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-600" />
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600'
      case 'offline':
        return 'text-red-600'
      case 'error':
        return 'text-yellow-600'
      default:
        return 'text-gray-400'
    }
  }

  // Overall status - if either is offline, show offline
  const overallStatus = status.api === 'online' && status.health === 'online' ? 'online' :
    status.api === 'error' || status.health === 'error' ? 'error' : 'offline'

  return (
    <div className="flex items-center space-x-2">
      {/* Compact status indicator */}
      <div className="flex items-center space-x-1.5">
        {getStatusIcon(overallStatus)}
        <span className={clsx('text-xs font-medium', getStatusColor(overallStatus))}>
          {overallStatus === 'online' ? 'System' : overallStatus === 'error' ? 'Issues' : 'Offline'}
        </span>
      </div>

      {/* Refresh button */}
      <button
        onClick={checkStatus}
        className="text-xs text-gray-400 hover:text-gray-600 px-1 py-0.5 rounded transition-colors"
        title="Refresh status"
      >
        ↻
      </button>
    </div>
  )
}
