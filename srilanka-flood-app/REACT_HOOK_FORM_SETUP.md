# React Hook Form Setup for Flood/Landslide Report

## Installation

```bash
npm install react-hook-form @hookform/resolvers yup
```

## Dependencies

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolvers
- `yup` - Schema validation

## Usage

```tsx
import FloodLandslideForm from './components/FloodLandslideForm'

function App() {
  return (
    <div>
      <FloodLandslideForm />
    </div>
  )
}
```

## Form Features

### Validation
- Type: Required, must be 'flood' or 'landslide'
- Severity: Required, must be 'low', 'medium', 'high', or 'critical'
- Location: Required
- Latitude: Required, must be 5.9-9.8 (Sri Lanka bounds)
- Longitude: Required, must be 79.7-81.9 (Sri Lanka bounds)
- Phone: Optional, must match Sri Lankan format (0XXXXXXXXX)

### Features
- ✅ Form validation with Yup schema
- ✅ Geolocation support
- ✅ Image upload with preview
- ✅ Map integration ready
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages

## API Integration

The form submits to:
```
POST /api/flood-landslide-reports
```

Request body:
```json
{
  "type": "flood",
  "location": "Colombo, Western Province",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "severity": "high",
  "description": "Severe flooding",
  "reportedBy": "John Doe",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Google Maps Integration

To integrate Google Maps for location selection:

```tsx
import { useEffect, useRef } from 'react'

// Inside component
const mapRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (mapRef.current && window.google) {
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 7.8731, lng: 80.7718 },
      zoom: 8,
    })

    map.addListener('click', (e: any) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      handleMapClick(lat, lng)
    })
  }
}, [])

// Update map container ref
<div ref={mapRef} id="flood-landslide-form-map" className="map-container"></div>
```

## Styling

Use the same CSS classes from your existing form:
- `.form-container`
- `.form-group`
- `.location-input-group`
- `.get-location-btn`
- `.location-status`
- `.image-upload-label`
- `.image-preview-container`
- `.submit-btn`
- `.loading-overlay`
- `.message.success-message`
- `.message.error-message`

