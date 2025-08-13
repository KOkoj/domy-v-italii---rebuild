import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const PropertyEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/properties')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600">Property ID: {id}</p>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-gray-600">Property edit form will be implemented here...</p>
        <p className="text-sm text-gray-500 mt-2">
          This page would contain the same form as PropertyNewPage but pre-filled with existing
          data.
        </p>
      </div>
    </div>
  )
}
