import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FileUploader, UploadedImage } from '@/components/ui/FileUploader'
import toast from 'react-hot-toast'

interface PropertyFormData {
  title: string
  description: string
  priceEuro: string
  type: string
  status: 'ACTIVE' | 'INACTIVE'
  address: string
  city: string
  region: string
  postalCode: string
  bedrooms: string
  bathrooms: string
  area: string
  lotSize: string
  yearBuilt: string
  images: string[]
  features: string[]
}

const initialFormData: PropertyFormData = {
  title: '',
  description: '',
  priceEuro: '',
  type: '',
  status: 'ACTIVE',
  address: '',
  city: '',
  region: '',
  postalCode: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  lotSize: '',
  yearBuilt: '',
  images: [],
  features: [],
}

export const PropertyNewPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentFeature, setCurrentFeature] = useState('')

  const createMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const response = await api.post('/properties', {
        ...data,
        priceEuro: parseFloat(data.priceEuro),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        area: parseInt(data.area),
        lotSize: data.lotSize ? parseInt(data.lotSize) : null,
        yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : null,
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create property')
      }

      return response.data.data
    },
    onSuccess: () => {
      toast.success('Property created successfully!')
      navigate('/properties')
    },
    onError: (error) => {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    },
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageUpload = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addFeature = () => {
    if (currentFeature.trim() && !formData.features.includes(currentFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()],
      }))
      setCurrentFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.priceEuro || isNaN(parseFloat(formData.priceEuro))) {
      newErrors.priceEuro = 'Valid price is required'
    }
    if (!formData.type) newErrors.type = 'Property type is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.region.trim()) newErrors.region = 'Region is required'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'
    if (!formData.bedrooms || isNaN(parseInt(formData.bedrooms))) {
      newErrors.bedrooms = 'Valid number of bedrooms is required'
    }
    if (!formData.bathrooms || isNaN(parseInt(formData.bathrooms))) {
      newErrors.bathrooms = 'Valid number of bathrooms is required'
    }
    if (!formData.area || isNaN(parseInt(formData.area))) {
      newErrors.area = 'Valid area is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/properties')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Property</h1>
          <p className="text-gray-600">Add a new property to your listings</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="Beautiful apartment in Florence"
            />
            <Input
              label="Price (EUR)"
              name="priceEuro"
              type="number"
              value={formData.priceEuro}
              onChange={handleChange}
              error={errors.priceEuro}
              placeholder="250000"
            />
            <Select
              label="Property Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={errors.type}
              placeholder="Select type"
              options={[
                { value: 'apartment', label: 'Apartment' },
                { value: 'house', label: 'House' },
                { value: 'villa', label: 'Villa' },
                { value: 'commercial', label: 'Commercial' },
              ]}
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                placeholder="Describe the property..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                placeholder="Via Roma 123"
              />
            </div>
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              placeholder="Florence"
            />
            <Input
              label="Region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              error={errors.region}
              placeholder="Tuscany"
            />
            <Input
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              error={errors.postalCode}
              placeholder="50100"
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleChange}
              error={errors.bedrooms}
              placeholder="3"
            />
            <Input
              label="Bathrooms"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleChange}
              error={errors.bathrooms}
              placeholder="2"
            />
            <Input
              label="Area (m²)"
              name="area"
              type="number"
              value={formData.area}
              onChange={handleChange}
              error={errors.area}
              placeholder="120"
            />
            <Input
              label="Lot Size (m²)"
              name="lotSize"
              type="number"
              value={formData.lotSize}
              onChange={handleChange}
              placeholder="500 (optional)"
            />
            <Input
              label="Year Built"
              name="yearBuilt"
              type="number"
              value={formData.yearBuilt}
              onChange={handleChange}
              placeholder="2010 (optional)"
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
          <FileUploader
            onUpload={handleImageUpload}
            maxFiles={10}
            accept="image/*"
            hint="Upload up to 10 images"
          />
          {formData.images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {formData.images.map((url, index) => (
                <UploadedImage key={index} src={url} onRemove={() => removeImage(index)} />
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Add a feature..."
              value={currentFeature}
              onChange={(e) => setCurrentFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <Button type="button" onClick={addFeature}>
              Add
            </Button>
          </div>
          {formData.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/properties')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Create Property
          </Button>
        </div>
      </form>
    </div>
  )
}
