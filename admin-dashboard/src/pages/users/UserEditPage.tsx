import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const UserEditPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/users')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600">Update user information and permissions</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Edit Form</h3>
          <p className="text-gray-600 mb-4">
            User edit form will be implemented here.
          </p>
          <p className="text-sm text-gray-500">
            User ID: {id}
          </p>
        </div>
      </div>
    </div>
  )
}