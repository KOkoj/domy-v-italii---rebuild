import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Settings, Save, Globe, Mail, DollarSign, MapPin, Palette, Bell } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import toast from 'react-hot-toast'

interface AppSettings {
  siteName: string
  contactEmail: string
  currency: string
  locale: string
  [key: string]: any
}

export const SettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AppSettings>({
    siteName: '',
    contactEmail: '',
    currency: '',
    locale: '',
  })
  const [hasChanges, setHasChanges] = useState(false)

  const { data: settings, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const response = await api.get('/settings')
        if (response.data.success) {
          return response.data.data as AppSettings
        }
        throw new Error(response.data.message || 'Failed to fetch settings')
      } catch (error) {
        const normalizedError = normalizeError(error)
        toast.error(normalizedError.message)
        throw error
      }
    },
  })

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      const response = await api.put('/settings', formData)

      if (response.data.success) {
        toast.success('Settings updated successfully')
        setHasChanges(false)
        refetch()
      } else {
        throw new Error(response.data.message || 'Failed to update settings')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (settings) {
      setFormData(settings)
      setHasChanges(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage application configuration and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Basic application configuration</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Site Name"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="Italian Real Estate"
                hint="The name that appears in the application header"
                required
              />
              
              <Input
                label="Contact Email"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="admin@example.com"
                hint="Primary contact email for the organization"
                required
              />
            </div>
          </div>
        </div>

        {/* Localization Settings */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Localization</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Regional and currency settings</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                options={[
                  { value: 'EUR', label: '€ Euro (EUR)' },
                  { value: 'USD', label: '$ US Dollar (USD)' },
                  { value: 'GBP', label: '£ British Pound (GBP)' },
                  { value: 'CHF', label: '₣ Swiss Franc (CHF)' },
                ]}
                hint="Default currency for property prices"
                required
              />
              
              <Select
                label="Locale"
                name="locale"
                value={formData.locale}
                onChange={handleChange}
                options={[
                  { value: 'it-IT', label: 'Italian (Italy)' },
                  { value: 'en-US', label: 'English (US)' },
                  { value: 'en-GB', label: 'English (UK)' },
                  { value: 'fr-FR', label: 'French (France)' },
                  { value: 'de-DE', label: 'German (Germany)' },
                ]}
                hint="Language and regional formatting"
                required
              />
            </div>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Display Preferences</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Customize the appearance and behavior</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Date Format"
                name="dateFormat"
                value={formData.dateFormat || 'DD/MM/YYYY'}
                onChange={handleChange}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European)' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
                ]}
                hint="How dates are displayed throughout the app"
              />
              
              <Select
                label="Items per Page"
                name="itemsPerPage"
                value={formData.itemsPerPage || '10'}
                onChange={handleChange}
                options={[
                  { value: '10', label: '10 items' },
                  { value: '25', label: '25 items' },
                  { value: '50', label: '50 items' },
                  { value: '100', label: '100 items' },
                ]}
                hint="Default number of items shown in lists"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Manage notification preferences</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={formData.emailNotifications || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                  Email notifications for new inquiries
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="browserNotifications"
                  name="browserNotifications"
                  checked={formData.browserNotifications || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, browserNotifications: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="browserNotifications" className="text-sm font-medium text-gray-700">
                  Browser notifications
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="weeklyReports"
                  name="weeklyReports"
                  checked={formData.weeklyReports || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="weeklyReports" className="text-sm font-medium text-gray-700">
                  Weekly activity reports
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>You have unsaved changes</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isLoading || !hasChanges}
            >
              Reset
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}