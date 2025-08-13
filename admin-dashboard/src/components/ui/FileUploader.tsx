import React, { useState } from 'react'
import { clsx } from 'clsx'
import { Upload, X } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { Button } from './Button'
import toast from 'react-hot-toast'

interface FileUploaderProps {
  onUpload: (urls: string[]) => void
  maxFiles?: number
  accept?: string
  label?: string
  hint?: string
  error?: string
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  maxFiles = 5,
  accept = 'image/*',
  label,
  hint,
  error,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return

    const fileArray = Array.from(files).slice(0, maxFiles)

    try {
      setIsUploading(true)

      const formData = new FormData()
      fileArray.forEach((file) => {
        formData.append('files', file)
      })

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        onUpload(response.data.data.urls)
        toast.success(`${fileArray.length} file(s) uploaded successfully`)
      } else {
        throw new Error(response.data.message || 'Upload failed')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      <div
        className={clsx(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300',
          error && 'border-red-500',
          isUploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="text-center">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Drop files here or click to upload</p>
              <p className="text-xs text-gray-500">
                Max {maxFiles} file(s), {accept}
              </p>
            </div>
          )}
        </div>
      </div>

      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

interface UploadedImageProps {
  src: string
  onRemove: () => void
  alt?: string
}

export const UploadedImage: React.FC<UploadedImageProps> = ({
  src,
  onRemove,
  alt = 'Uploaded image',
}) => {
  return (
    <div className="relative inline-block">
      <img
        src={src}
        alt={alt}
        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white rounded-full hover:bg-red-600"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
}
