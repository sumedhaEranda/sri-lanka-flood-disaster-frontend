import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// Types
interface FloodLandslideReport {
  type: 'flood' | 'landslide'
  location: string
  latitude: number
  longitude: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  reportedBy?: string
  phone?: string
  image?: string
}

// Validation Schema
const schema = yup.object({
  type: yup
    .string()
    .oneOf(['flood', 'landslide'], 'Please select a valid type')
    .required('Type is required'),
  location: yup.string().required('Location is required'),
  latitude: yup
    .number()
    .min(5.9, 'Latitude must be within Sri Lanka bounds')
    .max(9.8, 'Latitude must be within Sri Lanka bounds')
    .required('Latitude is required'),
  longitude: yup
    .number()
    .min(79.7, 'Longitude must be within Sri Lanka bounds')
    .max(81.9, 'Longitude must be within Sri Lanka bounds')
    .required('Longitude is required'),
  severity: yup
    .string()
    .oneOf(['low', 'medium', 'high', 'critical'], 'Please select a valid severity')
    .required('Severity is required'),
  description: yup.string().optional(),
  reportedBy: yup.string().optional(),
  phone: yup
    .string()
    .optional()
    .matches(/^0\d{9}$/, 'Please enter a valid Sri Lankan phone number (0XXXXXXXXX)'),
  image: yup.string().optional(),
})

// Component
const FloodLandslideForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [locationStatus, setLocationStatus] = useState<string>('')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FloodLandslideReport>({
    resolver: yupResolver(schema),
    defaultValues: {
      type: undefined,
      location: '',
      latitude: undefined as any,
      longitude: undefined as any,
      severity: undefined,
      description: '',
      reportedBy: '',
      phone: '',
      image: undefined,
    },
  })

  const watchedType = watch('type')
  const watchedLocation = watch('location')

  // Get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser')
      return
    }

    setLocationStatus('Detecting your location...')

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 60000,
          }
        )
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude

      // Validate Sri Lanka bounds
      if (lat < 5.9 || lat > 9.8 || lng < 79.7 || lng > 81.9) {
        setLocationStatus('Location must be within Sri Lanka. Please click on the map to select a location.')
        return
      }

      setValue('latitude', lat)
      setValue('longitude', lng)

      // Reverse geocode
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
        const data = await response.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setValue('location', address)
        setLocationStatus('Location set successfully')
        setTimeout(() => setLocationStatus(''), 2000)
      } catch (err) {
        setValue('location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        setLocationStatus('Location coordinates set')
      }
    } catch (err: any) {
      console.error('Geolocation error:', err)
      let errorMessage = 'Unable to get your location. Please click on the map to set your location.'

      if (err?.code === 1) {
        errorMessage = 'Location access denied. Please allow location access in your browser settings.'
      } else if (err?.code === 2) {
        errorMessage = 'Location information unavailable. Please make sure GPS is enabled.'
      } else if (err?.code === 3) {
        errorMessage = 'Location request timed out. Please try again.'
      }

      setLocationStatus(errorMessage)
    }
  }

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setValue('image', result)
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  // Remove image
  const removeImage = () => {
    setValue('image', undefined)
    setImagePreview(null)
  }

  // Handle map click (if using Google Maps)
  const handleMapClick = (lat: number, lng: number) => {
    if (lat < 5.9 || lat > 9.8 || lng < 79.7 || lng > 81.9) {
      setLocationStatus('Location must be within Sri Lanka bounds')
      return
    }

    setValue('latitude', lat)
    setValue('longitude', lng)

    // Reverse geocode
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setValue('location', address)
        setLocationStatus('Location set successfully')
        setTimeout(() => setLocationStatus(''), 2000)
      })
      .catch(() => {
        setValue('location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        setLocationStatus('Location coordinates set')
      })
  }

  // Submit form
  const onSubmit = async (data: FloodLandslideReport) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/flood-landslide-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit report')
      }

      const result = await response.json()
      setSuccess(true)
      reset()
      setImagePreview(null)
      setLocationStatus('')

      // Scroll to success message
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (err: any) {
      console.error('Error submitting report:', err)
      setError(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Report Flood or Landslide</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="help-form">
        {/* Type Selection */}
        <div className="form-group">
          <label htmlFor="type">
            Type <span style={{ color: 'red' }}>*</span>
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                id="type"
                className={errors.type ? 'error' : ''}
              >
                <option value="">Select Type</option>
                <option value="flood">Flood</option>
                <option value="landslide">Landslide</option>
              </select>
            )}
          />
          {errors.type && (
            <span className="error-message">{errors.type.message}</span>
          )}
        </div>

        {/* Severity */}
        <div className="form-group">
          <label htmlFor="severity">
            Severity <span style={{ color: 'red' }}>*</span>
          </label>
          <Controller
            name="severity"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                id="severity"
                className={errors.severity ? 'error' : ''}
              >
                <option value="">Select Severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            )}
          />
          {errors.severity && (
            <span className="error-message">{errors.severity.message}</span>
          )}
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">
            Location <span style={{ color: 'red' }}>*</span>
          </label>
          <div className="location-input-group">
            <input
              {...register('location')}
              type="text"
              id="location"
              placeholder="Location"
              className={errors.location ? 'error' : ''}
              readOnly
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="get-location-btn"
            >
              <span>📍</span>
              <span>Get My Location</span>
            </button>
          </div>
          {locationStatus && (
            <div
              className={`location-status ${
                locationStatus.includes('success') || locationStatus.includes('set')
                  ? 'location-status-success'
                  : locationStatus.includes('error') || locationStatus.includes('denied')
                  ? 'location-status-error'
                  : 'location-status-loading'
              }`}
            >
              {locationStatus}
            </div>
          )}
          {errors.location && (
            <span className="error-message">{errors.location.message}</span>
          )}
          {/* Map container - integrate with Google Maps */}
          <div id="flood-landslide-form-map" className="map-container"></div>
          <p className="map-instruction">
            Click on the map to select location
          </p>
          <input
            {...register('latitude', { valueAsNumber: true })}
            type="hidden"
            id="latitude"
          />
          <input
            {...register('longitude', { valueAsNumber: true })}
            type="hidden"
            id="longitude"
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            {...register('description')}
            id="description"
            rows={4}
            placeholder="Enter description..."
          />
        </div>

        {/* Reported By */}
        <div className="form-group">
          <label htmlFor="reportedBy">Reported By</label>
          <input
            {...register('reportedBy')}
            type="text"
            id="reportedBy"
            placeholder="Name..."
          />
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="Phone..."
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && (
            <span className="error-message">{errors.phone.message}</span>
          )}
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label htmlFor="verification-image" className="image-upload-label">
            <span>📷</span>
            <span>Upload Image</span>
            <span className="optional-badge">(Optional)</span>
          </label>
          <div className="image-upload-container">
            <input
              type="file"
              id="verification-image"
              accept="image/*"
              className="image-input"
              capture="environment"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">Saving...</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="message success-message">
          <h2>✅ Report Submitted</h2>
          <p>Your flood/landslide report has been submitted successfully.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="message error-message">
          <h2>❌ Error</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default FloodLandslideForm

