import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Mail, Phone, Calendar, Building, Eye } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { DataTable, Column, PaginationMeta } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED'
  createdAt: string
  property?: {
    id: string
    title: string
    city: string
  }
}

interface InquiriesResponse {
  items: Inquiry[]
  meta: PaginationMeta
}

export const InquiriesPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inquiries', page, search, status],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(search && { search }),
          ...(status && { status }),
        })

        const response = await api.get(`/inquiries?${params}`)
        
        // Handle 501 Not Implemented response
        if (response.status === 501) {
          return { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
        }
        
        if (response.data.success) {
          return response.data.data as InquiriesResponse
        }
        throw new Error(response.data.message || 'Failed to fetch inquiries')
      } catch (error) {
        // Handle 501 errors gracefully
        if (error.response?.status === 501) {
          console.log('Inquiries endpoint not yet implemented')
          return { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
        }
        
        const normalizedError = normalizeError(error)
        toast.error(normalizedError.message)
        throw error
      }
    },
  })

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true)
      const response = await api.put(`/inquiries/${id}`, { status: newStatus })
      
      if (response.data.success) {
        toast.success('Inquiry status updated successfully')
        refetch()
        if (selectedInquiry?.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus as any })
        }
      } else {
        throw new Error(response.data.message || 'Failed to update inquiry status')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns: Column<Inquiry>[] = [
    {
      key: 'name',
      header: 'Contact',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 flex items-center space-x-1">
            <Mail className="w-3 h-3" />
            <span>{item.email}</span>
          </div>
          {item.phone && (
            <div className="text-sm text-gray-500 flex items-center space-x-1">
              <Phone className="w-3 h-3" />
              <span>{item.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'property',
      header: 'Property',
      render: (value) => (
        <div>
          {value ? (
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900 text-sm">{value.title}</div>
                <div className="text-xs text-gray-500">{value.city}</div>
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">General inquiry</span>
          )}
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 truncate">
            {value.length > 60 ? value.substring(0, 60) + '...' : value}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value.replace('_', ' ').toLowerCase()}
          </span>
          <Select
            value={value}
            onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
            options={[
              { value: 'NEW', label: 'New' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'CLOSED', label: 'Closed' },
            ]}
            className="text-xs w-24"
            disabled={isUpdatingStatus}
          />
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Received',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <div>
            <div>{new Date(value).toLocaleDateString()}</div>
            <div className="text-xs">{new Date(value).toLocaleTimeString()}</div>
          </div>
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
            onClick={() => setSelectedInquiry(item)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600">Manage customer inquiries and messages</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="col-span-2"
          />
          <Select
            placeholder="All Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'NEW', label: 'New' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'CLOSED', label: 'Closed' },
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
        emptyMessage="No inquiries found. Customer inquiries will appear here."
      />

      {/* Inquiry Detail Modal */}
      <Modal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title="Inquiry Details"
        size="lg"
      >
        {selectedInquiry && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{selectedInquiry.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 hover:text-blue-800">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${selectedInquiry.phone}`} className="text-blue-600 hover:text-blue-800">
                        {selectedInquiry.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inquiry Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedInquiry.property && (
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{selectedInquiry.property.title}</div>
                        <div className="text-sm text-gray-500">{selectedInquiry.property.city}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInquiry.status)}`}>
                      {selectedInquiry.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Message</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Select
                value={selectedInquiry.status}
                onChange={(e) => handleStatusUpdate(selectedInquiry.id, e.target.value)}
                options={[
                  { value: 'NEW', label: 'Mark as New' },
                  { value: 'IN_PROGRESS', label: 'Mark as In Progress' },
                  { value: 'CLOSED', label: 'Mark as Closed' },
                ]}
                disabled={isUpdatingStatus}
                className="w-48"
              />
              <Button
                onClick={() => setSelectedInquiry(null)}
                variant="secondary"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}