import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { DataTable, Column, PaginationMeta } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface Property {
  id: string
  title: string
  slug: string
  priceEuro: number
  type: string
  status: 'ACTIVE' | 'INACTIVE'
  city: string
  region: string
  bedrooms: number
  bathrooms: number
  area: number
  createdAt: string
  updatedAt: string
}

interface PropertiesResponse {
  items: Property[]
  meta: PaginationMeta
}

export const PropertiesPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['properties', page, search, type, status],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(search && { search }),
          ...(type && { type }),
          ...(status && { status }),
        })

        const response = await api.get(`/properties?${params}`)
        if (response.data.success) {
          return response.data.data as PropertiesResponse
        }
        throw new Error(response.data.message || 'Failed to fetch properties')
      } catch (error) {
        const normalizedError = normalizeError(error)
        toast.error(normalizedError.message)
        throw error
      }
    },
  })

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/properties/${id}`)
      if (response.data.success) {
        toast.success('Property deleted successfully')
        refetch()
      } else {
        throw new Error(response.data.message || 'Failed to delete property')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    } finally {
      setDeleteId(null)
    }
  }

  const columns: Column<Property>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">
            {item.city}, {item.region}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => <span className="capitalize text-gray-700">{value}</span>,
    },
    {
      key: 'priceEuro',
      header: 'Price',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">€{value.toLocaleString()}</span>
      ),
    },
    {
      key: 'area',
      header: 'Area',
      render: (value, item) => (
        <div className="text-sm">
          <div>{value} m²</div>
          <div className="text-gray-500">
            {item.bedrooms}bed • {item.bathrooms}bath
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, item) => (
        <div className="flex items-center space-x-2">
          <Link to={`/properties/${item.id}`}>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <Link to="/properties/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="col-span-2"
          />
          <Select
            placeholder="All Types"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'apartment', label: 'Apartment' },
              { value: 'house', label: 'House' },
              { value: 'villa', label: 'Villa' },
              { value: 'commercial', label: 'Commercial' },
            ]}
          />
          <Select
            placeholder="All Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
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
        emptyMessage="No properties found. Create your first property to get started."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}
