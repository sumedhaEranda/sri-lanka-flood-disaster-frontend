# API Documentation - Sri Lanka Flood Disaster App

This document lists all APIs and external services used in the application.

## 1. Google Maps JavaScript API

### Purpose
- Display interactive maps showing disaster centers
- Show user location on help request form
- Create markers for disaster centers
- Display info windows with center details

### API Key
```
AIzaSyCWC3jzv7Pccpd6lMD0t9H5h6KU2g7A6jY
```

### Implementation
- **URL**: `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`
- **Location**: `index.html`
- **Libraries Used**: 
  - Maps JavaScript API (core)
  - Places Library (for future use)

### Features Used
- `google.maps.Map` - Main map instance
- `google.maps.Marker` - Map markers for disaster centers
- `google.maps.InfoWindow` - Popup windows with center information
- `google.maps.LatLngBounds` - Fit map to show all markers
- `google.maps.Geocoder` - Convert coordinates to addresses
- `google.maps.SymbolPath` - Custom marker icons

### Usage Locations
- **Dashboard Map**: `src/disaster-centers.ts` - Shows all disaster centers
- **Help Form Map**: `src/homeless-help.ts` - Shows user's current location

---

## 2. Google Maps Geocoding API

### Purpose
- Reverse geocoding: Convert latitude/longitude coordinates to readable addresses
- Used when user's location is detected or when clicking on map

### Implementation
- **Method**: `google.maps.Geocoder.geocode()`
- **Location**: `src/homeless-help.ts`
- **Usage**: Automatically called when location is detected

### Example
```javascript
const geocoder = new google.maps.Geocoder()
geocoder.geocode({ location: { lat, lng } }, (results, status) => {
  // Convert coordinates to address
})
```

---

## 3. Browser Geolocation API

### Purpose
- Get user's current GPS location automatically
- Used in Help Request form to detect user's location

### Implementation
- **API**: `navigator.geolocation.getCurrentPosition()`
- **Location**: `src/homeless-help.ts`
- **Features**:
  - Automatic location detection on form load
  - Manual "Get My Location" button
  - High accuracy GPS
  - Error handling for permission denied, timeout, etc.

### Usage
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords
    // Use coordinates
  },
  (error) => {
    // Handle error
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
)
```

---

## 4. Browser localStorage API

### Purpose
- Store disaster centers created by users
- Store help requests submitted
- Persist data across page refreshes

### Implementation
- **Methods Used**:
  - `localStorage.setItem(key, value)` - Save data
  - `localStorage.getItem(key)` - Retrieve data
  - `JSON.parse()` / `JSON.stringify()` - Convert to/from JSON

### Data Stored
1. **Disaster Centers**: `localStorage.getItem('disasterCenters')`
   - Stores newly created disaster centers
   - Merged with default centers on load

2. **Help Requests**: `localStorage.getItem('helpRequests')`
   - Stores all submitted help requests
   - Used in dashboard to display requests

### Usage Locations
- `src/disaster-centers.ts` - Load/save disaster centers
- `src/homeless-help.ts` - Save help requests
- `src/create-center.ts` - Save new disaster centers

---

## API Configuration Summary

### Google Maps API Setup

1. **API Key**: `AIzaSyCWC3jzv7Pccpd6lMD0t9H5h6KU2g7A6jY`
2. **Enabled APIs** (in Google Cloud Console):
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional, for future use)

3. **API Restrictions** (Recommended):
   - HTTP referrer restrictions
   - Limit to your domain(s)

### API Endpoints Used

| API | Endpoint | Purpose |
|-----|----------|---------|
| Google Maps JS | `https://maps.googleapis.com/maps/api/js` | Load map library |
| Geocoding | `google.maps.Geocoder.geocode()` | Convert coordinates to addresses |
| Geolocation | `navigator.geolocation` | Get user's GPS location |
| localStorage | Browser API | Store data locally |

---

## API Rate Limits & Quotas

### Google Maps API
- **Free Tier**: $200 credit per month
- **Maps JavaScript API**: 
  - Dynamic Maps: $7 per 1,000 loads
  - Static Maps: $2 per 1,000 requests
- **Geocoding API**: 
  - $5 per 1,000 requests

### Browser APIs
- **Geolocation**: No limits (browser native)
- **localStorage**: ~5-10MB per domain (varies by browser)

---

## Environment Variables (Recommended)

Create a `.env` file for production:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCWC3jzv7Pccpd6lMD0t9H5h6KU2g7A6jY
```

Then update `index.html`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=%VITE_GOOGLE_MAPS_API_KEY%&libraries=places"></script>
```

---

## API Security Notes

1. **Google Maps API Key**:
   - Currently exposed in `index.html`
   - For production, use environment variables
   - Set API key restrictions in Google Cloud Console
   - Limit to specific HTTP referrers

2. **Geolocation**:
   - Requires user permission
   - Only works over HTTPS (or localhost)
   - User can deny permission

3. **localStorage**:
   - Domain-specific
   - Can be cleared by user
   - Not secure for sensitive data

---

## Future API Integrations (Optional)

1. **Backend API** (if you add a server):
   - POST `/api/help-requests` - Submit help requests
   - GET `/api/disaster-centers` - Get all centers
   - POST `/api/disaster-centers` - Create new center
   - GET `/api/help-requests` - Get all requests

2. **SMS/Notification API**:
   - Twilio API - Send SMS notifications
   - Firebase Cloud Messaging - Push notifications

3. **Weather API**:
   - OpenWeatherMap - Get flood/weather alerts
   - Weather.gov API - Weather warnings

---

## Testing APIs

### Test Google Maps API
1. Open browser console
2. Type: `typeof google`
3. Should return: `"object"` (if loaded)

### Test Geolocation
1. Open Help Request form
2. Check browser console for location data
3. Verify map shows your location

### Test localStorage
1. Open browser DevTools → Application → Local Storage
2. Check for `disasterCenters` and `helpRequests` keys

---

## Troubleshooting

### Google Maps not loading
- Check API key is valid
- Verify Maps JavaScript API is enabled
- Check browser console for errors
- Verify API key restrictions allow your domain

### Geolocation not working
- Ensure HTTPS (or localhost)
- Check browser permissions
- Verify device has GPS/location services enabled

### localStorage issues
- Check browser storage quota
- Clear browser cache if needed
- Verify browser supports localStorage

