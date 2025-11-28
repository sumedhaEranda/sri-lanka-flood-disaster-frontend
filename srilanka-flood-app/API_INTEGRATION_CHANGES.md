# API Integration Changes

## Overview
All mockup data and localStorage usage has been removed. The application now connects to a backend API at `http://localhost:3000/api`.

## Changes Made

### 1. New API Service (`src/api.ts`)
- Created comprehensive API service with all endpoints
- Handles all API calls with proper error handling
- Supports both Base64 and file upload for images
- Includes location validation and geocoding endpoints

### 2. Removed Mock Data
- **`src/disaster-centers.ts`**: Removed `defaultDisasterCenters` array
- **`src/disaster-centers.ts`**: Removed `getDisasterCenters()` function that used localStorage
- **`src/disaster-centers.ts`**: Removed `refreshDisasterCenters()` that read from localStorage
- **`src/homeless-help.ts`**: Removed localStorage save for help requests
- **`src/create-center.ts`**: Removed localStorage save for disaster centers

### 3. API Integration Points

#### Disaster Centers
- `loadDisasterCenters()` - Loads all centers from API
- `loadDashboardData()` - Loads centers and statistics in parallel
- Statistics are fetched from `/api/statistics` endpoint
- Centers are fetched from `/api/disaster-centers` endpoint

#### Help Requests
- `loadHelpRequests()` - Loads help requests from API
- `submitHelpRequest()` - Submits new requests to API
- Requests are fetched from `/api/help-requests` endpoint

#### Create Center Form
- `createDisasterCenter()` - Creates new centers via API
- Form submission now uses API instead of localStorage

### 4. Updated Functions

#### `setupDashboard()` (now async)
- Changed to async function
- Calls `loadDashboardData()` to fetch from API
- Updates statistics display from API response
- Handles errors gracefully

#### `displayHelpRequests()`
- Now accepts requests array as parameter
- Fetches from API via `loadHelpRequests()`
- Handles both `timestamp` and `createdAt` fields

#### `createDashboardHTML()`
- Statistics calculated from loaded centers (fallback)
- Will be updated from API statistics when available

### 5. Error Handling
- All API calls wrapped in try-catch blocks
- User-friendly error messages displayed
- Graceful fallbacks when API fails
- Console logging for debugging

### 6. Loading States
- Refresh button shows loading state
- Disabled during API calls
- Visual feedback for users

## API Endpoints Used

### Base URL
```
http://localhost:3000/api
```

### Endpoints
- `GET /disaster-centers` - Get all centers
- `GET /disaster-centers/:id` - Get single center
- `POST /disaster-centers` - Create center
- `PUT /disaster-centers/:id` - Update center
- `PATCH /disaster-centers/:id` - Partial update
- `DELETE /disaster-centers/:id` - Delete center
- `GET /disaster-centers/search?q=term` - Search centers
- `GET /disaster-centers/nearby?lat=&lng=&radius=` - Find nearby centers

- `GET /help-requests` - Get all requests (with pagination/filters)
- `GET /help-requests/:id` - Get single request
- `POST /help-requests` - Submit request
- `PATCH /help-requests/:id` - Update request
- `PATCH /help-requests/:id/status` - Update status
- `POST /help-requests/:id/assign` - Assign to center
- `DELETE /help-requests/:id` - Delete request

- `GET /statistics` - Get dashboard statistics
- `GET /statistics/centers` - Center statistics
- `GET /statistics/requests` - Request statistics
- `GET /statistics/timeline?days=7` - Timeline statistics

- `POST /upload/image` - Upload image file
- `POST /upload/image/base64` - Upload Base64 image
- `GET /images/:id` - Get image
- `DELETE /upload/image/:id` - Delete image

- `POST /validate/location` - Validate coordinates
- `GET /location/bounds` - Get Sri Lanka bounds
- `POST /location/reverse-geocode` - Coordinates to address
- `POST /location/geocode` - Address to coordinates

## Configuration

### Environment Variable
The API base URL can be configured via environment variable:
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

Default: `http://localhost:3000/api`

## Data Models

### DisasterCenter
```typescript
{
  id?: string
  name: string
  address: string
  phone: string
  latitude: number
  longitude: number
  capacity: number
  services: string[]
  status: 'active' | 'full' | 'limited'
  image?: string
  additionalInfo?: string
  createdAt?: string
  updatedAt?: string
}
```

### HelpRequest
```typescript
{
  id?: string
  name: string
  phone: string
  location: string
  latitude?: number
  longitude?: number
  numberOfPeople: number
  urgentNeeds: string[]
  urgencyLevel: string
  additionalInfo: string
  verificationImage?: string
  timestamp?: Date | string
  status?: 'pending' | 'processing' | 'completed'
  assignedCenter?: string
}
```

### Statistics
```typescript
{
  totalCenters: number
  activeCenters: number
  limitedCenters: number
  fullCenters: number
  totalCapacity: number
  totalHelpRequests: number
  pendingRequests: number
  processingRequests: number
  completedRequests: number
  criticalRequests?: number
  urgentRequests?: number
  moderateRequests?: number
  lastUpdated: string
}
```

## Testing

### Before Testing
1. Ensure backend is running on `http://localhost:3000`
2. Backend should implement all endpoints listed in `BACKEND_FEATURES_LIST.md`
3. CORS should be configured to allow requests from frontend origin

### Test Scenarios
1. **Load Dashboard**: Should load centers and statistics from API
2. **Submit Help Request**: Should save to API, not localStorage
3. **Create Center**: Should create via API
4. **Refresh Data**: Should reload from API
5. **Error Handling**: Should show error messages if API fails

## Migration Notes

### Breaking Changes
- No more default/mock data on page load
- All data must come from backend API
- localStorage no longer used for centers or requests
- Language preference still uses localStorage (intentional)

### Backward Compatibility
- Frontend handles both `timestamp` and `createdAt` fields
- Handles both paginated and non-paginated API responses
- Graceful fallback if statistics API fails

## Next Steps

1. **Backend Implementation**: Implement all endpoints as per `BACKEND_FEATURES_LIST.md`
2. **Testing**: Test all API endpoints with Postman collection
3. **Error Handling**: Add more specific error messages
4. **Loading States**: Add loading indicators for better UX
5. **Caching**: Consider adding client-side caching for better performance

