# Railway/Road Reports API Endpoints

## Base URL
```
/api/railway-road-reports
```

---

## 1. GET - Fetch All Reports

**Endpoint:** `GET /api/railway-road-reports`

**Query Parameters:**
- `limit` (optional, number): Number of results per page (default: 50)
- `offset` (optional, number): Number of results to skip (default: 0)
- `type` (optional, string): Filter by type - `'railway'` or `'road'`
- `severity` (optional, string): Filter by severity - `'low'`, `'medium'`, `'high'`, `'critical'`
- `sort` (optional, string): Field to sort by (default: `'timestamp'`)
- `order` (optional, string): Sort order - `'asc'` or `'desc'` (default: `'desc'`)

**Example Request:**
```
GET /api/railway-road-reports?limit=50&offset=0&type=road&severity=high&sort=timestamp&order=desc
```

**Response:**
```json
{
  "data": [
    {
      "id": "rrr123",
      "type": "road",
      "location": "Colombo-Kandy Highway, Kandy",
      "latitude": 7.2906,
      "longitude": 80.6337,
      "severity": "high",
      "description": "Major road blockage due to landslide",
      "reportedBy": "John Doe",
      "phone": "0765367297",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "timestamp": "2024-01-15T10:30:00Z",
      "verified": false,
      "verifiedAt": null,
      "verifiedBy": null,
      "roadType": "highway",
      "railwayLine": null,
      "peopleAffected": 150,
      "roadAccess": "completely-blocked",
      "affectedDistance": 2.5,
      "estimatedRepairTime": "2-3 days"
    },
    {
      "id": "rrr124",
      "type": "railway",
      "location": "Colombo Fort Railway Station",
      "latitude": 6.9344,
      "longitude": 79.8428,
      "severity": "critical",
      "description": "Track damage on main line",
      "reportedBy": "Jane Smith",
      "phone": "0771234567",
      "image": null,
      "timestamp": "2024-01-15T11:00:00Z",
      "verified": true,
      "verifiedAt": "2024-01-15T11:30:00Z",
      "verifiedBy": "admin",
      "roadType": null,
      "railwayLine": "Colombo-Kandy",
      "peopleAffected": 500,
      "roadAccess": null,
      "affectedDistance": 0.5,
      "estimatedRepairTime": "4-6 hours"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

## 2. GET - Fetch Report by ID

**Endpoint:** `GET /api/railway-road-reports/:id`

**URL Parameter:**
- `id`: Report ID (string)

**Example Request:**
```
GET /api/railway-road-reports/rrr123
```

**Response:**
```json
{
  "id": "rrr123",
  "type": "road",
  "location": "Colombo-Kandy Highway, Kandy",
  "latitude": 7.2906,
  "longitude": 80.6337,
  "severity": "high",
  "description": "Major road blockage due to landslide",
  "reportedBy": "John Doe",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z",
  "verified": false,
  "verifiedAt": null,
  "verifiedBy": null,
  "roadType": "highway",
  "railwayLine": null,
  "peopleAffected": 150,
  "roadAccess": "completely-blocked",
  "affectedDistance": 2.5,
  "estimatedRepairTime": "2-3 days"
}
```

---

## 3. POST - Create New Report

**Endpoint:** `POST /api/railway-road-reports`

**Request Body:**
```json
{
  "type": "road",
  "location": "Colombo-Kandy Highway, Kandy",
  "latitude": 7.2906,
  "longitude": 80.6337,
  "severity": "high",
  "description": "Major road blockage due to landslide",
  "reportedBy": "John Doe",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z",
  "roadType": "highway",
  "peopleAffected": 150,
  "roadAccess": "completely-blocked",
  "affectedDistance": 2.5,
  "estimatedRepairTime": "2-3 days"
}
```

**Required Fields:**
- `type`: `'railway'` or `'road'`
- `location`: string
- `latitude`: number (must be within Sri Lanka: 5.9-9.8)
- `longitude`: number (must be within Sri Lanka: 79.7-81.9)
- `severity`: `'low'`, `'medium'`, `'high'`, or `'critical'`
- `reportedBy`: string

**Optional Fields:**
- `description`: string
- `phone`: string (Sri Lankan format: 0XXXXXXXXX)
- `image`: string (Base64 encoded image)
- `timestamp`: string (ISO 8601 format) - defaults to current time if not provided
- `roadType`: `'highway'`, `'main-road'`, `'local-road'`, `'bridge'`, or `'tunnel'` (only for road type)
- `railwayLine`: string (only for railway type, e.g., "Colombo-Kandy")
- `peopleAffected`: number (integer, >= 0)
- `roadAccess`: `'accessible'`, `'partially-blocked'`, or `'completely-blocked'` (only for road type)
- `affectedDistance`: number (float, >= 0, in kilometers)
- `estimatedRepairTime`: string (e.g., "2-3 hours", "1 day", "2-3 days")

**Response:**
```json
{
  "id": "rrr123",
  "type": "road",
  "location": "Colombo-Kandy Highway, Kandy",
  "latitude": 7.2906,
  "longitude": 80.6337,
  "severity": "high",
  "description": "Major road blockage due to landslide",
  "reportedBy": "John Doe",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z",
  "verified": false,
  "verifiedAt": null,
  "verifiedBy": null,
  "roadType": "highway",
  "railwayLine": null,
  "peopleAffected": 150,
  "roadAccess": "completely-blocked",
  "affectedDistance": 2.5,
  "estimatedRepairTime": "2-3 days"
}
```

---

## 4. PUT - Update Report

**Endpoint:** `PUT /api/railway-road-reports/:id`

**URL Parameter:**
- `id`: Report ID (string)

**Request Body:**
```json
{
  "severity": "critical",
  "location": "Updated location",
  "description": "Updated description",
  "reportedBy": "Updated Name",
  "phone": "0765367297",
  "peopleAffected": 200,
  "roadAccess": "partially-blocked",
  "affectedDistance": 3.0,
  "estimatedRepairTime": "3-4 days"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "id": "rrr123",
  "type": "road",
  "location": "Updated location",
  "latitude": 7.2906,
  "longitude": 80.6337,
  "severity": "critical",
  "description": "Updated description",
  "reportedBy": "Updated Name",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z",
  "verified": false,
  "verifiedAt": null,
  "verifiedBy": null,
  "roadType": "highway",
  "railwayLine": null,
  "peopleAffected": 200,
  "roadAccess": "partially-blocked",
  "affectedDistance": 3.0,
  "estimatedRepairTime": "3-4 days"
}
```

---

## 5. PATCH - Partial Update Report

**Endpoint:** `PATCH /api/railway-road-reports/:id`

**URL Parameter:**
- `id`: Report ID (string)

**Request Body:**
```json
{
  "severity": "critical",
  "verified": true,
  "verifiedBy": "admin"
}
```

**Note:** Similar to PUT but explicitly for partial updates. Only provided fields will be updated.

**Response:**
```json
{
  "id": "rrr123",
  "type": "road",
  "location": "Colombo-Kandy Highway, Kandy",
  "latitude": 7.2906,
  "longitude": 80.6337,
  "severity": "critical",
  "description": "Major road blockage due to landslide",
  "reportedBy": "John Doe",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z",
  "verified": true,
  "verifiedAt": "2024-01-15T12:00:00Z",
  "verifiedBy": "admin",
  "roadType": "highway",
  "railwayLine": null,
  "peopleAffected": 150,
  "roadAccess": "completely-blocked",
  "affectedDistance": 2.5,
  "estimatedRepairTime": "2-3 days"
}
```

---

## 6. PUT - Verify/Unverify Report

**Endpoint:** `PUT /api/railway-road-reports/:id/verify`

**URL Parameter:**
- `id`: Report ID (string)

**Request Body:**
```json
{
  "verified": true,
  "verifiedBy": "admin"
}
```

**Response:**
```json
{
  "id": "rrr123",
  "type": "road",
  "location": "Colombo-Kandy Highway, Kandy",
  "latitude": 7.2906,
  "longitude": 80.6337,
  "severity": "high",
  "description": "Major road blockage due to landslide",
  "reportedBy": "John Doe",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z",
  "verified": true,
  "verifiedAt": "2024-01-15T12:00:00Z",
  "verifiedBy": "admin",
  "roadType": "highway",
  "railwayLine": null,
  "peopleAffected": 150,
  "roadAccess": "completely-blocked",
  "affectedDistance": 2.5,
  "estimatedRepairTime": "2-3 days"
}
```

**Note:** This endpoint allows verification without authentication (can use 'anonymous' as verifiedBy). The backend should auto-set `verifiedAt` timestamp when `verified` is set to `true`.

---

## 7. DELETE - Delete Report

**Endpoint:** `DELETE /api/railway-road-reports/:id`

**URL Parameter:**
- `id`: Report ID (string)

**Example Request:**
```
DELETE /api/railway-road-reports/rrr123
```

**Response:**
```
204 No Content
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "fields": {
    "latitude": "Latitude must be within Sri Lanka bounds (5.9-9.8)",
    "severity": "Severity must be one of: low, medium, high, critical",
    "type": "Type must be either 'railway' or 'road'",
    "roadType": "roadType is only valid for road type reports",
    "railwayLine": "railwayLine is only valid for railway type reports"
  }
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Report with id 'rrr123' not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Validation Rules

### Location Validation
- `latitude`: Must be between 5.9 and 9.8 (Sri Lanka bounds)
- `longitude`: Must be between 79.7 and 81.9 (Sri Lanka bounds)

### Type Validation
- `type`: Must be either `'railway'` or `'road'`

### Severity Validation
- `severity`: Must be one of: `'low'`, `'medium'`, `'high'`, `'critical'`

### Road Type Validation (only for road type)
- `roadType`: Must be one of: `'highway'`, `'main-road'`, `'local-road'`, `'bridge'`, `'tunnel'`
- `roadType` should be `null` or not provided for railway type reports

### Railway Line Validation (only for railway type)
- `railwayLine`: String (e.g., "Colombo-Kandy", "Colombo-Galle")
- `railwayLine` should be `null` or not provided for road type reports

### Road Access Validation (only for road type)
- `roadAccess`: Must be one of: `'accessible'`, `'partially-blocked'`, `'completely-blocked'`
- `roadAccess` should be `null` or not provided for railway type reports

### People Affected Validation
- `peopleAffected`: Optional, must be a non-negative integer (>= 0)

### Affected Distance Validation
- `affectedDistance`: Optional, must be a non-negative number (>= 0), in kilometers

### Estimated Repair Time Validation
- `estimatedRepairTime`: Optional, string (e.g., "2-3 hours", "1 day", "2-3 days")

### Phone Validation
- `phone`: Optional, but if provided, should match Sri Lankan format: `0XXXXXXXXX` (10 digits starting with 0)

### Image Validation
- `image`: Optional, Base64 encoded image string
- Format: `data:image/{type};base64,{base64_string}`
- Recommended max size: 5MB

### Reported By Validation
- `reportedBy`: Required, string (non-empty)

---

## Data Model

### RailwayRoadReport Interface

```typescript
interface RailwayRoadReport {
  id?: string                    // Auto-generated unique identifier
  type: 'railway' | 'road'       // Required: Type of report
  location: string               // Required: Location description
  latitude: number               // Required: Latitude (5.9-9.8)
  longitude: number              // Required: Longitude (79.7-81.9)
  severity: 'low' | 'medium' | 'high' | 'critical'  // Required: Severity level
  description?: string           // Optional: Detailed description
  reportedBy?: string            // Optional: Name of reporter
  phone?: string                // Optional: Contact phone number
  image?: string                 // Optional: Base64 encoded image
  timestamp?: Date | string      // Auto-generated: ISO 8601 timestamp
  verified?: boolean            // Auto-generated: Verification status
  verifiedAt?: string            // Auto-generated: Verification timestamp
  verifiedBy?: string           // Auto-generated: User who verified
  roadType?: 'highway' | 'main-road' | 'local-road' | 'bridge' | 'tunnel'  // Optional: Only for road type
  railwayLine?: string           // Optional: Only for railway type
  peopleAffected?: number        // Optional: Number of people affected
  roadAccess?: 'accessible' | 'partially-blocked' | 'completely-blocked'  // Optional: Only for road type
  affectedDistance?: number     // Optional: Affected distance in km
  estimatedRepairTime?: string  // Optional: Estimated repair time
}
```

---

## Example Use Cases

### Example 1: Report a Road Blockage
```bash
POST /api/railway-road-reports
Content-Type: application/json

{
  "type": "road",
  "location": "Colombo-Kandy Highway, near Peradeniya",
  "latitude": 7.2906,
  "longitude": 80.6337,
  "severity": "critical",
  "description": "Major landslide blocking entire highway",
  "reportedBy": "John Doe",
  "phone": "0765367297",
  "roadType": "highway",
  "peopleAffected": 200,
  "roadAccess": "completely-blocked",
  "affectedDistance": 3.5,
  "estimatedRepairTime": "2-3 days"
}
```

### Example 2: Report Railway Track Damage
```bash
POST /api/railway-road-reports
Content-Type: application/json

{
  "type": "railway",
  "location": "Colombo Fort Railway Station",
  "latitude": 6.9344,
  "longitude": 79.8428,
  "severity": "high",
  "description": "Track damage on main line, trains delayed",
  "reportedBy": "Jane Smith",
  "phone": "0771234567",
  "railwayLine": "Colombo-Kandy",
  "peopleAffected": 500,
  "affectedDistance": 0.5,
  "estimatedRepairTime": "4-6 hours"
}
```

### Example 3: Fetch Critical Road Reports
```bash
GET /api/railway-road-reports?type=road&severity=critical&sort=timestamp&order=desc&limit=10
```

### Example 4: Update Report Verification Status
```bash
PATCH /api/railway-road-reports/rrr123
Content-Type: application/json

{
  "verified": true,
  "verifiedBy": "admin"
}
```

---

## Notes for Backend Implementation

1. **Auto-generated Fields**: The backend should auto-generate:
   - `id`: Unique identifier (UUID or similar)
   - `timestamp`: Current timestamp if not provided
   - `verified`: Default to `false`
   - `verifiedAt`: `null` initially
   - `verifiedBy`: `null` initially

2. **Type-specific Validation**: 
   - When `type` is `'road'`, validate `roadType` and `roadAccess` if provided
   - When `type` is `'railway'`, validate `railwayLine` if provided
   - Ensure `roadType` and `roadAccess` are not set for railway reports
   - Ensure `railwayLine` is not set for road reports

3. **Location Validation**: Always validate that coordinates are within Sri Lanka bounds:
   - Latitude: 5.9 to 9.8
   - Longitude: 79.7 to 81.9

4. **Pagination**: The GET endpoint should support pagination with `limit` and `offset` parameters.

5. **Sorting**: Default sorting should be by `timestamp` in descending order (newest first).

6. **Image Storage**: Consider storing images separately and returning URLs instead of base64 strings for better performance.

7. **Verification**: Implement verification endpoints if needed:
   - `PUT /api/railway-road-reports/:id/verify` - Verify/unverify a report
