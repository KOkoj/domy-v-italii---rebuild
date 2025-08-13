import React from 'react'
import { useParams } from 'react-router-dom'

export const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600">User ID: {id}</p>
      </div>

      <div className="card p-6">
        <p className="text-gray-600">User edit form will be implemented here...</p>
      </div>
    </div>
  )
}
