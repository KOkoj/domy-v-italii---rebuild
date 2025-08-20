import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Calendar, User } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { DataTable, Column, PaginationMeta } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { isAxiosError } from 'axios' // ✅ added

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  status: 'DRAFT' | 'PUBLISHED'
  coverImage?: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

interface BlogResponse {
  items: BlogPost[]
  meta: PaginationMeta
}

export const BlogPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['blog', page, search, status],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(search && { search }),
          ...(status && { status }),
        })

        const response = await api.get(`/blog?${params}`)
        
        // Handle 501 Not Implemented response
        if (response.status === 501) {
          return { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
        }
        
        if (response.data?.success) {
          return response.data.data as BlogResponse
        }
        throw new Error(response.data?.message || 'Failed to fetch blog posts')
      } catch (error: unknown) { // ✅ typed
        // Handle 501 errors gracefully (only if Axios error)
        if (isAxiosError(error) && error.response?.status === 501) {
          console.log('Blog endpoint not yet implemented')
          return { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
        }
        
        const normalizedError = normalizeError(error)
        toast.error(normalizedError.message)
        throw error
      }
    },
  })

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      const response = await api.delete(`/blog/${id}`)
      if (response.data?.success) {
        toast.success('Blog post deleted successfully')
        refetch()
      } else {
        throw new Error(response.data?.message || 'Failed to delete blog post')
      }
    } catch (error: unknown) { // ✅ typed
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
      const response = await api.put(`/blog/${id}`, { status: newStatus })
      
      if (response.data?.success) {
        toast.success(`Post ${newStatus.toLowerCase()} successfully`)
        refetch()
      } else {
        throw new Error(response.data?.message || 'Failed to update post status')
      }
    } catch (error: unknown) { // ✅ typed
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    }
  }

  const columns: Column<BlogPost>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900 truncate max-w-xs">{value}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {item.content ? item.content.substring(0, 60) + '...' : 'No content'}
          </div>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value.name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {value.toLowerCase()}
          </span>
          <button
            onClick={() => handleStatusToggle(item.id, value)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            title={`Change to ${value === 'PUBLISHED' ? 'draft' : 'published'}`}
          >
            Toggle
          </button>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
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
          <Link to={`/blog/${item.id}`}>
            <Button variant="ghost" size="sm" title="Edit">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(item.id)}
            className="text-red-600 hover:text-red-700"
            title="Delete"
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
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">Manage your blog content and articles</p>
        </div>
        <Link to="/blog/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search posts..."
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
              { value: 'DRAFT', label: 'Draft' },
              { value: 'PUBLISHED', label: 'Published' },
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
        emptyMessage="No blog posts found. Create your first post to get started."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}
