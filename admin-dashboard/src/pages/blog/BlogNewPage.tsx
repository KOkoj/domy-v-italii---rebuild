import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import toast from 'react-hot-toast'

export const BlogNewPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'DRAFT',
    coverImage: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      const response = await api.post('/blog', formData)

      if (response.data.success) {
        toast.success('Blog post created successfully')
        navigate('/blog')
      } else {
        throw new Error(response.data.message || 'Failed to create blog post')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAsDraft = async () => {
    const draftData = { ...formData, status: 'DRAFT' }
    setFormData(draftData)
    
    // Trigger form submission with draft status
    setTimeout(() => {
      const event = new Event('submit') as any
      event.preventDefault = () => {}
      handleSubmit(event)
    }, 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Blog Post</h1>
          <p className="text-gray-600">Write and publish a new blog article</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveAsDraft}
            disabled={isLoading}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={() => navigate('/blog')}
            variant="ghost"
            disabled={isLoading}
          >
            Cancel
          </Button>
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
                <h3 className="text-sm font-medium text-gray-700 mb-3">Publishing Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Post will be created with current timestamp</p>
                  <p>• Author will be set automatically</p>
                  <p>• URL slug will be generated from title</p>
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
            {formData.status === 'PUBLISHED' ? 'Publish Post' : 'Save Draft'}
          </Button>
        </div>
      </form>
    </div>
  )
}