import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import toast from 'react-hot-toast'

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

export const BlogEditPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'DRAFT',
    coverImage: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      try {
        const response = await api.get(`/blog/${id}`)
        if (response.data.success) {
          return response.data.data as BlogPost
        }
        throw new Error(response.data.message || 'Failed to fetch blog post')
      } catch (error) {
        const normalizedError = normalizeError(error)
        toast.error(normalizedError.message)
        throw error
      }
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        status: post.status,
        coverImage: post.coverImage || '',
      })
    }
  }, [post])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsLoading(true)
      const response = await api.put(`/blog/${id}`, formData)

      if (response.data.success) {
        toast.success('Blog post updated successfully')
        navigate('/blog')
      } else {
        throw new Error(response.data.message || 'Failed to update blog post')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await api.put(`/blog/${id}`, { ...formData, status: newStatus })

      if (response.data.success) {
        toast.success(`Post ${newStatus.toLowerCase()} successfully`)
        setFormData(prev => ({ ...prev, status: newStatus as 'DRAFT' | 'PUBLISHED' }))
      } else {
        throw new Error(response.data.message || 'Failed to update post status')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    }
  }

  if (isLoadingPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading blog post...</span>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Blog post not found</h2>
        <p className="text-gray-600 mb-4">The blog post you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/blog')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
            <p className="text-gray-600">Update your blog article</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {formData.status === 'DRAFT' ? (
            <Button
              type="button"
              onClick={() => handleStatusChange('PUBLISHED')}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleStatusChange('DRAFT')}
              disabled={isLoading}
            >
              Unpublish
            </Button>
          )}
        </div>
      </div>

      {/* Meta Info */}
      <div className="card p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Created: {new Date(post.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(post.updatedAt).toLocaleString()}</span>
            <span>Author: {post.author.name}</span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {post.status.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="Enter blog post title"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={12}
                  className="input resize-none"
                  placeholder="Write your blog post content here..."
                  required
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PUBLISHED', label: 'Published' },
                ]}
                required
              />

              <Input
                label="Cover Image URL"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                hint="Optional: Add a cover image URL"
              />

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Post Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Slug:</strong> {post.slug}</p>
                  <p><strong>ID:</strong> {post.id}</p>
                  <p><strong>Created:</strong> {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/blog')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Update Post
          </Button>
        </div>
      </form>
    </div>
  )
}