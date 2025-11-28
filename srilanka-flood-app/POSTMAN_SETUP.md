# Postman Collection Setup Guide

## Importing the Collection

1. **Open Postman**
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `Sri_Lanka_Flood_App.postman_collection.json`
5. Click **Import**

## Collection Structure

The collection includes:

### 1. Google Maps API
- Load Maps JavaScript API
- Reverse Geocoding (coordinates → address)
- Forward Geocoding (address → coordinates)

### 2. Disaster Centers API
- `GET /api/disaster-centers` - Get all centers
- `GET /api/disaster-centers/:id` - Get specific center
- `POST /api/disaster-centers` - Create new center (with phone validation)
- `PUT /api/disaster-centers/:id` - Update center
- `DELETE /api/disaster-centers/:id` - Delete center

### 3. Help Requests API
- `GET /api/help-requests` - Get all requests (with pagination)
- `GET /api/help-requests/:id` - Get specific request
- `POST /api/help-requests` - Submit new help request
- `PATCH /api/help-requests/:id/status` - Update request status

### 4. Statistics API
- `GET /api/statistics` - Get dashboard statistics

## Environment Variables

The collection uses these variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:3000` | Backend API base URL |
| `google_maps_api_key` | `AIzaSyCWC3jzv7Pccpd6lMD0t9H5h6KU2g7A6jY` | Google Maps API Key |

### Setting Up Environment

1. In Postman, click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Name it: `Sri Lanka Flood App - Local`
4. Add variables:
   - `base_url`: `http://localhost:3000`
   - `google_maps_api_key`: `AIzaSyCWC3jzv7Pccpd6lMD0t9H5h6KU2g7A6jY`
5. Click **Save**
6. Select the environment from dropdown (top right)

## Testing Google Maps API

### Test Reverse Geocoding
1. Open **Google Maps API** → **Geocoding API - Reverse Geocode**
2. Update `latlng` parameter with coordinates
3. Click **Send**
4. Should return address information

### Test Forward Geocoding
1. Open **Google Maps API** → **Geocoding API - Forward Geocode**
2. Update `address` parameter
3. Click **Send**
4. Should return coordinates

## Testing Backend APIs (When Implemented)

### Current Status
⚠️ **Note**: The backend APIs are not yet implemented. These endpoints are for future use when you add a backend server.

### Example Backend Implementation

If using Node.js/Express:

```javascript
// Example endpoint structure
app.get('/api/disaster-centers', (req, res) => {
  // Return all centers
});

app.post('/api/disaster-centers', (req, res) => {
  // Validate phone number
  // Create new center
  // Return created center
});

app.post('/api/help-requests', (req, res) => {
  // Validate request
  // Save to database
  // Return created request
});
```

## Request Examples

### Create Disaster Center
```json
POST /api/disaster-centers
{
  "name": "New Disaster Center",
  "address": "123 Main Street, City",
  "phone": "+94 11 1234567",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "capacity": 300,
  "services": ["Shelter", "Food", "Medical"],
  "status": "active"
}
```

### Submit Help Request
```json
POST /api/help-requests
{
  "name": "John Doe",
  "phone": "+94 77 1234567",
  "location": "Colombo, Sri Lanka",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "numberOfPeople": 5,
  "urgentNeeds": ["shelter", "food", "medical"],
  "additionalInfo": "Family with children"
}
```

## Phone Number Validation

The API validates Sri Lankan phone numbers:
- Format: `+94 XX XXXXXXX` (with country code)
- Format: `0XX XXXXXXX` (local format)
- Must be 9 digits after country code or 10 digits with leading 0

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Server Error |

## Testing Tips

1. **Start with Google Maps API** - These work immediately
2. **Use Postman Console** - View request/response details
3. **Save Responses** - Use "Save Response" for examples
4. **Create Tests** - Add automated tests in Postman
5. **Use Collections Runner** - Run multiple requests in sequence

## Next Steps

1. Import the collection into Postman
2. Test Google Maps API endpoints (these work now)
3. When you add a backend, update `base_url` variable
4. Test backend endpoints as you implement them

