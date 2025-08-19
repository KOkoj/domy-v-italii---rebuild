import React, { useState, useEffect, useCallback } from 'react'
import { Building2, FileText, MessageSquare, TrendingUp, Calendar, Users, AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

interface DashboardStats {
  propertiesCount: number
  activePropertiesCount: number
  draftsCount: number
  inquiriesTodayCount: number
  inquiriesWeekCount: number
}

interface PropertyItem {
  id: string
  title: string
  city: string
  type: string
  createdAt: string
}

interface BlogItem {
  id: string
  title: string
  status: string
  createdAt: string
  author?: { name: string }
}

interface InquiryItem {
  id: string
  name: string
  email: string
  status: string
  createdAt: string
  property?: { title: string }
}

interface DashboardActivity {
  properties: PropertyItem[]
  blog: BlogItem[]
  inquiries: InquiryItem[]
}

interface DashboardData {
  stats: DashboardStats
  activity: DashboardActivity
}

const StatCard: React.FC<{
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
  trend?: { value: number; isPositive: boolean }
}> = ({ title, value, icon: Icon, iconColor, iconBg, trend }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
              <span className="font-medium">{Math.abs(trend.value)}%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)

const ActivityCard: React.FC<{
  title: string
  items: PropertyItem[] | BlogItem[] | InquiryItem[]
  type: 'properties' | 'blog' | 'inquiries'
  icon: React.ComponentType<{ className?: string }>
}> = ({ title, items, type, icon: Icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{items.length} items</p>
        </div>
      </div>
    </div>
    <div className="p-6">
      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No recent {type}</p>
          <p className="text-gray-400 text-sm mt-1">New {type} will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.slice(0, 5).map((item, index) => (
            <div key={item.id || index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {'title' in item ? item.title : 'name' in item ? item.name : 'Unknown'}
                </p>
                {type === 'properties' && 'city' in item && 'type' in item && (
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="inline-flex items-center space-x-1">
                      <span>{item.city}</span>
                      <span>•</span>
                      <span className="capitalize">{item.type}</span>
                    </span>
                  </p>
                )}
                {type === 'blog' && 'author' in item && 'status' in item && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">By {item.author?.name || 'Unknown'}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {item.status.toLowerCase()}
                    </span>
                  </div>
                )}
                {type === 'inquiries' && 'email' in item && 'status' in item && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{item.email}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {item.status.toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-xs text-gray-400 flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {items.length > 5 && (
            <div className="text-center pt-3 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all {items.length} {type}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)

export const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fallbackMode, setFallbackMode] = useState(false)

  // Fetch dashboard data from individual endpoints as fallback
  const fetchFallbackData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get properties data
      const propertiesResponse = await api.get('/properties?limit=5')
      const properties = propertiesResponse.data.success ? propertiesResponse.data.data.items : []
      
      // Try to get users count
      try {
        const usersResponse = await api.get('/users?limit=1')
        // Can be used for future dashboard stats if needed
        console.log('Users available:', usersResponse.data.success ? usersResponse.data.data.meta?.total || 0 : 0)
      } catch (e) {
        console.log('Users endpoint not available')
      }

      // Create fallback dashboard data using available information
      const fallbackData: DashboardData = {
        stats: {
          propertiesCount: properties.length,
          activePropertiesCount: properties.filter((p: any) => p.status === 'ACTIVE').length,
          draftsCount: 0, // No blog data available
          inquiriesTodayCount: 0, // No inquiries data available
          inquiriesWeekCount: 0
        },
        activity: {
          properties: properties.slice(0, 5).map((p: any) => ({
            id: p.id,
            title: p.title,
            city: p.city || 'Unknown',
            type: p.type,
            createdAt: p.createdAt
          })),
          blog: [], // No blog data available
          inquiries: [] // No inquiries data available
        }
      }

      setDashboardData(fallbackData)
      setFallbackMode(true)
    } catch (error: any) {
      setError('Unable to load dashboard data. Please check your connection.')
      console.error('Fallback dashboard fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch dashboard data (requires auth)
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setFallbackMode(false)

    try {
      const response = await api.get('/dashboard', {
        timeout: 10000,
      })

      if (response.data.success) {
        setDashboardData(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard data')
      }
    } catch (error: any) {
      console.log('Dashboard endpoint not available, trying fallback...')
      // If dashboard endpoint is not available, try fallback
      await fetchFallbackData()
    }
  }, [fetchFallbackData])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [fetchDashboardData, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-6">Please log in to view your dashboard analytics and manage your properties.</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-8 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Activity Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-white rounded-xl shadow-sm border border-red-200 p-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <Button
            onClick={fetchDashboardData}
            className="mr-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Fallback Mode Notice */}
      {fallbackMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Dashboard running in limited mode</p>
              <p className="text-xs text-yellow-700">Some endpoints are still deploying. Showing available data.</p>
            </div>
          </div>
        </div>
      )}

      {dashboardData && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Properties"
              value={dashboardData.stats.propertiesCount}
              icon={Building2}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Active Properties"
              value={dashboardData.stats.activePropertiesCount}
              icon={Building2}
              iconColor="text-green-600"
              iconBg="bg-green-50"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Draft Posts"
              value={dashboardData.stats.draftsCount}
              icon={FileText}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
              trend={{ value: 5, isPositive: false }}
            />
            <StatCard
              title="Inquiries This Week"
              value={dashboardData.stats.inquiriesWeekCount}
              icon={MessageSquare}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
              trend={{ value: 15, isPositive: true }}
            />
          </div>

          {/* Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActivityCard
              title="Latest Properties"
              items={dashboardData.activity.properties}
              type="properties"
              icon={Building2}
            />
            <ActivityCard
              title="Latest Blog Posts"
              items={dashboardData.activity.blog}
              type="blog"
              icon={FileText}
            />
            <ActivityCard
              title="Latest Inquiries"
              items={dashboardData.activity.inquiries}
              type="inquiries"
              icon={MessageSquare}
            />
          </div>
        </>
      )}
    </div>
  )
}