# Backend Integration Guide

## Overview
This guide explains how to connect the frontend application to a backend API.

## Base URL Configuration
Update the base URL in your frontend code to point to your backend:

```typescript
const API_BASE_URL = 'http://localhost:3000/api' // Change to your backend URL
```

## Required Backend Endpoints

### 1. Disaster Centers API

#### GET /api/disaster-centers
**Description**: Get all disaster centers

**Response**:
```json
[
  {
    "id": "dc1",
    "name": "Colombo Disaster Management Center",
    "address": "Colombo 07, Western Province",
    "phone": "+94 11 2345678",
    "latitude": 6.9271,
    "longitude": 79.8612,
    "capacity": 500,
    "services": ["Shelter", "Food", "Medical", "Clothing"],
    "status": "active",
    "image": "https://example.com/images/center1.jpg",
    "additionalInfo": "24/7 emergency services available",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /api/disaster-centers
**Description**: Create a new disaster center

**Request Body**:
```json
{
  "name": "New Disaster Center",
  "address": "123 Main Street, City",
  "phone": "+94 11 1234567",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "capacity": 300,
  "services": ["Shelter", "Food", "Medical"],
  "status": "active",
  "image": "data:image/jpeg;base64,...",
  "additionalInfo": "24/7 emergency services"
}
```

**Validation Rules**:
- Phone: Must match Sri Lankan format `+94 XX XXXXXXX` or `0XX XXXXXXX`
- Location: Must be within Sri Lanka bounds (lat: 5.9-9.8, lng: 79.7-81.9)
- Services: At least one service required
- All fields except `image` and `additionalInfo` are required

### 2. Help Requests API

#### POST /api/help-requests
**Description**: Submit a new help request

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "+94 77 1234567",
  "location": "Colombo, Sri Lanka",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "numberOfPeople": 5,
  "urgentNeeds": ["shelter", "food", "medical"],
  "urgencyLevel": "critical",
  "additionalInfo": "Family with children",
  "verificationImage": "data:image/jpeg;base64,..."
}
```

**Validation Rules**:
- Phone: Must match Sri Lankan format
- Location: Must be within Sri Lanka bounds
- UrgentNeeds: At least one must be selected
- UrgencyLevel: Must be "critical", "urgent", or "moderate"
- All fields except `verificationImage` and `additionalInfo` are required

#### GET /api/help-requests
**Description**: Get all help requests with pagination

**Query Parameters**:
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)
- `status`: Filter by status (pending, processing, completed)
- `urgencyLevel`: Filter by urgency (critical, urgent, moderate)

### 3. Statistics API

#### GET /api/statistics
**Description**: Get dashboard statistics

**Response**:
```json
{
  "totalCenters": 8,
  "activeCenters": 7,
  "limitedCenters": 1,
  "fullCenters": 0,
  "totalCapacity": 2580,
  "totalHelpRequests": 15,
  "pendingRequests": 8,
  "processingRequests": 5,
  "completedRequests": 2,
  "criticalRequests": 3,
  "urgentRequests": 7,
  "moderateRequests": 5,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## Frontend Integration Steps

### Step 1: Create API Service File
Create `src/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export async function fetchDisasterCenters() {
  const response = await fetch(`${API_BASE_URL}/disaster-centers`)
  if (!response.ok) throw new Error('Failed to fetch centers')
  return response.json()
}

export async function createDisasterCenter(data: any) {
  const response = await fetch(`${API_BASE_URL}/disaster-centers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create center')
  }
  return response.json()
}

export async function submitHelpRequest(data: any) {
  const response = await fetch(`${API_BASE_URL}/help-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to submit request')
  }
  return response.json()
}

export async function fetchHelpRequests(params?: { limit?: number; offset?: number; status?: string }) {
  const query = new URLSearchParams(params as any).toString()
  const response = await fetch(`${API_BASE_URL}/help-requests?${query}`)
  if (!response.ok) throw new Error('Failed to fetch requests')
  return response.json()
}

export async function fetchStatistics() {
  const response = await fetch(`${API_BASE_URL}/statistics`)
  if (!response.ok) throw new Error('Failed to fetch statistics')
  return response.json()
}

export async function validateLocation(lat: number, lng: number) {
  const response = await fetch(`${API_BASE_URL}/validate/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lng })
  })
  return response.json()
}
```

### Step 2: Update Frontend Code
Replace localStorage calls with API calls:

**In `src/disaster-centers.ts`**:
```typescript
import { fetchDisasterCenters, fetchStatistics } from './api.ts'

// Replace getDisasterCenters() function
async function loadDisasterCenters(): Promise<DisasterCenter[]> {
  try {
    const centers = await fetchDisasterCenters()
    return centers
  } catch (error) {
    console.error('Error loading centers:', error)
    return defaultDisasterCenters // Fallback to defaults
  }
}
```

**In `src/create-center.ts`**:
```typescript
import { createDisasterCenter } from './api.ts'

// Replace saveDisasterCenter function
async function saveDisasterCenter(center: DisasterCenter): Promise<void> {
  await createDisasterCenter(center)
}
```

**In `src/homeless-help.ts`**:
```typescript
import { submitHelpRequest } from './api.ts'

// Replace submitToDisasterCenter function
async function submitToDisasterCenter(request: HelpRequest): Promise<void> {
  await submitHelpRequest(request)
}
```

## Environment Variables
Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Error Handling
Implement proper error handling:

```typescript
try {
  const result = await fetchDisasterCenters()
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    // Show user-friendly error message
    alert(error.message)
  }
}
```

## Testing
Use the Postman collection (`Sri_Lanka_Flood_App.postman_collection.json`) to test all endpoints before integrating with frontend.

## Phone Number Validation Regex
```javascript
/^(?:\+94|0)(?:11|2[1-8]|3[1-8]|4[1-8]|5[1-7]|6[3-7]|81|91)\d{7}$/
```

## Location Validation
Sri Lanka bounds:
- Latitude: 5.9 to 9.8
- Longitude: 79.7 to 81.9

## Image Handling
Two options:
1. **Base64**: Send image as Base64 string in JSON
2. **File Upload**: Use multipart/form-data to upload file, get URL back

For file upload:
```typescript
const formData = new FormData()
formData.append('image', file)
formData.append('type', 'center') // or 'verification'

const response = await fetch(`${API_BASE_URL}/upload/image`, {
  method: 'POST',
  body: formData
})
const { url } = await response.json()
// Use url instead of base64
```

