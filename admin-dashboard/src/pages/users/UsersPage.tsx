import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, Calendar, Shield, Edit, User, Crown, Briefcase } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { DataTable, Column, PaginationMeta } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  isActive: boolean
  createdAt: string
  updatedAt: string
  avatar?: string
}

interface UsersResponse {
  items: User[]
  meta: PaginationMeta
}

export const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    role: '',
    isActive: true,
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(search && { search }),
          ...(roleFilter && { role: roleFilter }),
        })

        const response = await api.get(`/users?${params}`)
        if (response.data.success) {
          return response.data.data as UsersResponse
        }
        throw new Error(response.data.message || 'Failed to fetch users')
      } catch (error) {
        const normalizedError = normalizeError(error)
        toast.error(normalizedError.message)
        throw error
      }
    },
  })

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      role: user.role,
      isActive: user.isActive,
    })
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      setIsUpdating(true)
      const response = await api.put(`/users/${selectedUser.id}`, editForm)
      
      if (response.data.success) {
        toast.success('User updated successfully')
        refetch()
        setSelectedUser(null)
      } else {
        throw new Error(response.data.message || 'Failed to update user')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'MANAGER':
        return <Briefcase className="w-4 h-4 text-blue-600" />
      case 'EMPLOYEE':
        return <User className="w-4 h-4 text-gray-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-yellow-100 text-yellow-800'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'EMPLOYEE':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canEditUser = (user: User, currentUserRole: string = 'ADMIN') => {
    // For demo purposes, assume current user is admin
    // In real app, you'd get this from auth context
    if (currentUserRole === 'ADMIN') return true
    if (currentUserRole === 'MANAGER' && user.role === 'EMPLOYEE') return true
    return false
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10">
            {item.avatar ? (
              <img className="w-10 h-10 rounded-full" src={item.avatar} alt={value} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 flex items-center space-x-1">
              <Mail className="w-3 h-3" />
              <span>{item.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          {getRoleIcon(value)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(value)}`}>
            {value.toLowerCase()}
          </span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, item) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(item)}
            disabled={!canEditUser(item)}
            title={canEditUser(item) ? 'Edit User' : 'Insufficient permissions'}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Total: {data?.meta.total || 0} users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="col-span-2"
          />
          <Select
            placeholder="All Roles"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'EMPLOYEE', label: 'Employee' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data?.items || []}
        columns={columns}
        pagination={data?.meta}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="No users found. Users will appear here as they are added to the system."
      />

      {/* Edit User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Edit User"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12">
                {selectedUser.avatar ? (
                  <img className="w-12 h-12 rounded-full" src={selectedUser.avatar} alt={selectedUser.name} />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedUser.name}</h3>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-xs text-gray-500">
                  Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <Select
                label="Role"
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                options={[
                  { value: 'ADMIN', label: 'Admin - Full system access' },
                  { value: 'MANAGER', label: 'Manager - Limited admin access' },
                  { value: 'EMPLOYEE', label: 'Employee - Basic access' },
                ]}
                required
              />

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active user (can log in and access the system)
                </label>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Security Note</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Role changes take effect immediately. Inactive users cannot log in.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => setSelectedUser(null)}
                variant="secondary"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                isLoading={isUpdating}
              >
                Update User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}