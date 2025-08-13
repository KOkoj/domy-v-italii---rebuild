import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const BlogNewPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/blog')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
          <p className="text-gray-600">Write a new blog post</p>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-gray-600">Blog creation form will be implemented here...</p>
      </div>
    </div>
  )
}
