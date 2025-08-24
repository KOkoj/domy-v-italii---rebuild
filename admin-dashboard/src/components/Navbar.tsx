import React, { useState } from 'react'
import { Menu, User, LogOut, Settings, Building2, FileText } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { EnvWidget } from './EnvWidget'
import { Button } from './ui/Button'
import { useLocation, useNavigate } from 'react-router-dom'

interface NavbarProps {
  onMenuClick: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  // const displayName = user?.name || user?.email || 'User';
  // const initials = displayName
  //   .trim()
  //   .split(/\s+/)
  //   .map(p => p[0]?.toUpperCase())
  //   .slice(0, 2)
  //   .join('') || 'U';
  // const avatarUrl = user?.avatar || '';

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const appName = import.meta.env.VITE_APP_NAME || 'Italian Real Estate Admin'
  const isDashboard = location.pathname === '/dashboard'

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur border-b flex items-center justify-between px-4">
      {/* Left: title/breadcrumbs */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden lg:block min-w-0 flex-1">
          {isDashboard ? (
            <div>
              <h1 className="text-lg font-bold text-gray-900 truncate">Dashboard Overview</h1>
              <p className="text-xs text-gray-600 truncate">
                Welcome back! Here's what's happening with your properties.
              </p>
            </div>
          ) : (
            <h1 className="text-lg font-semibold text-gray-900 truncate">{appName}</h1>
          )}
        </div>
      </div>

      {/* Right: EnvWidget + user menu */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* Dashboard Actions */}
        {isDashboard && (
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => navigate('/properties/new')}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Add Property</span>
            </button>
            <button
              onClick={() => navigate('/blog/new')}
              className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>New Post</span>
            </button>
          </div>
        )}

        {/* Environment Widget */}
        <div className="hidden md:block">
          <EnvWidget />
        </div>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-gray-600" />
              </div>
            )}
            <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
          </Button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {user?.role ? user.role.toLowerCase() : 'user'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      navigate('/settings')
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      logout()
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
