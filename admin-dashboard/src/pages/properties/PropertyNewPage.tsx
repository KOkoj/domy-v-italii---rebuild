import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import { api, normalizeError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import toast from 'react-hot-toast'

export const PropertyNewPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceCents: '',
    type: 'apartment',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    lotSize: '',
    yearBuilt: '',
    features: [] as string[],
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

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      features: checked
        ? [...prev.features, value]
        : prev.features.filter(f => f !== value)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.priceCents || isNaN(Number(formData.priceCents))) {
      newErrors.priceCents = 'Valid price is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.region.trim()) {
      newErrors.region = 'Region is required'
    }

    if (!formData.bedrooms || isNaN(Number(formData.bedrooms))) {
      newErrors.bedrooms = 'Valid number of bedrooms is required'
    }

    if (!formData.bathrooms || isNaN(Number(formData.bathrooms))) {
      newErrors.bathrooms = 'Valid number of bathrooms is required'
    }

    if (!formData.area || isNaN(Number(formData.area))) {
      newErrors.area = 'Valid area is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsLoading(true)
      
      // Convert price from euros to cents
      const priceCents = Math.round(Number(formData.priceCents) * 100)
      
      const payload = {
        ...formData,
        priceCents,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        ...(formData.lotSize && { lotSize: Number(formData.lotSize) }),
        ...(formData.yearBuilt && { yearBuilt: Number(formData.yearBuilt) }),
      }

      const response = await api.post('/properties', payload)

      if (response.data.success) {
        toast.success('Property created successfully')
        navigate('/properties')
      } else {
        throw new Error(response.data.message || 'Failed to create property')
      }
    } catch (error) {
      const normalizedError = normalizeError(error)
      toast.error(normalizedError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const commonFeatures = [
    'Swimming Pool', 'Garden', 'Parking', 'Balcony', 'Terrace', 'Elevator',
    'Air Conditioning', 'Heating', 'Fireplace', 'Wine Cellar', 'Gym',
    'Security System', 'Mountain View', 'Sea View', 'City View'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/properties')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
            <p className="text-gray-600">Create a new property listing</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Property Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="Elegant Villa in Tuscany"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input resize-none"
                  placeholder="Describe the property features and location..."
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (EUR)"
                  name="priceCents"
                  type="number"
                  value={formData.priceCents}
                  onChange={handleChange}
                  error={errors.priceCents}
                  placeholder="750000"
                  required
                />

                <Select
                  label="Property Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={[
                    { value: 'apartment', label: 'Apartment' },
                    { value: 'house', label: 'House' },
                    { value: 'villa', label: 'Villa' },
                    { value: 'palazzo', label: 'Palazzo' },
                    { value: 'penthouse', label: 'Penthouse' },
                    { value: 'farmhouse', label: 'Farmhouse' },
                    { value: 'commercial', label: 'Commercial' },
                  ]}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Via del Chianti 123"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  placeholder="Florence"
                  required
                />

                <Input
                  label="Region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  error={errors.region}
                  placeholder="Tuscany"
                  required
                />
              </div>

              <Input
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="50100"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Property Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Bedrooms"
              name="bedrooms"
              type="number"
              min="1"
              value={formData.bedrooms}
              onChange={handleChange}
              error={errors.bedrooms}
              placeholder="3"
              required
            />

            <Input
              label="Bathrooms"
              name="bathrooms"
              type="number"
              min="1"
              step="0.5"
              value={formData.bathrooms}
              onChange={handleChange}
              error={errors.bathrooms}
              placeholder="2"
              required
            />

            <Input
              label="Area (m²)"
              name="area"
              type="number"
              min="1"
              value={formData.area}
              onChange={handleChange}
              error={errors.area}
              placeholder="150"
              required
            />

            <Input
              label="Lot Size (m²)"
              name="lotSize"
              type="number"
              value={formData.lotSize}
              onChange={handleChange}
              placeholder="500"
              hint="Optional"
            />
          </div>

          <Input
            label="Year Built"
            name="yearBuilt"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            value={formData.yearBuilt}
            onChange={handleChange}
            placeholder="2020"
            hint="Optional"
          />
        </div>

        {/* Features */}
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Features</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {commonFeatures.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={feature}
                  value={feature}
                  checked={formData.features.includes(feature)}
                  onChange={handleFeaturesChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={feature} className="text-sm text-gray-700">
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/properties')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Create Property
          </Button>
        </div>
      </form>
    </div>
  )
}