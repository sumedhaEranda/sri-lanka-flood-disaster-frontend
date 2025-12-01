# Flood/Landslide Reports API Endpoints

## Base URL
```
/api/flood-landslide-reports
```

---

## 1. GET - Fetch All Reports

**Endpoint:** `GET /api/flood-landslide-reports`

**Query Parameters:**
- `limit` (optional, number): Number of results per page (default: 50)
- `offset` (optional, number): Number of results to skip (default: 0)
- `type` (optional, string): Filter by type - `'flood'` or `'landslide'`
- `severity` (optional, string): Filter by severity - `'low'`, `'medium'`, `'high'`, `'critical'`
- `sort` (optional, string): Field to sort by (default: `'timestamp'`)
- `order` (optional, string): Sort order - `'asc'` or `'desc'` (default: `'desc'`)

**Example Request:**
```
GET /api/flood-landslide-reports?limit=50&offset=0&type=flood&severity=high&sort=timestamp&order=desc
```

**Response:**
```json
{
  "data": [
    {
      "id": "flr123",
      "type": "flood",
      "location": "Colombo, Western Province",
      "latitude": 6.9271,
      "longitude": 79.8612,
      "severity": "high",
      "description": "Severe flooding in the area",
      "reportedBy": "John Doe",
      "phone": "0765367297",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "timestamp": "2024-01-15T10:30:00Z",
      "verified": false,
      "verifiedAt": null,
      "verifiedBy": null
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

## 2. POST - Create New Report

**Endpoint:** `POST /api/flood-landslide-reports`

**Request Body:**
```json
{
  "type": "flood",
  "location": "Colombo, Western Province",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "severity": "high",
  "description": "Severe flooding in the area",
  "reportedBy": "John Doe",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Required Fields:**
- `type`: `'flood'` or `'landslide'`
- `location`: string
- `latitude`: number (must be within Sri Lanka: 5.9-9.8)
- `longitude`: number (must be within Sri Lanka: 79.7-81.9)
- `severity`: `'low'`, `'medium'`, `'high'`, or `'critical'`

**Optional Fields:**
- `description`: string
- `reportedBy`: string
- `phone`: string (Sri Lankan format: 0XXXXXXXXX)
- `image`: string (Base64 encoded image)
- `timestamp`: string (ISO 8601 format)

**Response:**
```json
{
  "id": "flr123",
  "type": "flood",
  "location": "Colombo, Western Province",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "severity": "high",
  "description": "Severe flooding in the area",
  "reportedBy": "John Doe",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z",
  "verified": false,
  "verifiedAt": null,
  "verifiedBy": null
}
```

---

## 3. PUT - Update Report

**Endpoint:** `PUT /api/flood-landslide-reports/:id`

**URL Parameter:**
- `id`: Report ID (string)

**Request Body:**
```json
{
  "type": "flood",
  "severity": "critical",
  "location": "Updated location",
  "description": "Updated description",
  "reportedBy": "Updated Name",
  "phone": "0765367297"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "id": "flr123",
  "type": "flood",
  "location": "Updated location",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "severity": "critical",
  "description": "Updated description",
  "reportedBy": "Updated Name",
  "phone": "0765367297",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2024-01-15T10:30:00Z",
  "verified": false,
  "verifiedAt": null,
  "verifiedBy": null
}
```

---

## 4. DELETE - Delete Report

**Endpoint:** `DELETE /api/flood-landslide-reports/:id`

**URL Parameter:**
- `id`: Report ID (string)

**Example Request:**
```
DELETE /api/flood-landslide-reports/flr123
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
    "severity": "Severity must be one of: low, medium, high, critical"
  }
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Report with id 'flr123' not found"
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
- `type`: Must be either `'flood'` or `'landslide'`

### Severity Validation
- `severity`: Must be one of: `'low'`, `'medium'`, `'high'`, `'critical'`

### Phone Validation
- `phone`: Optional, but if provided, should match Sri Lankan format: `0XXXXXXXXX` (10 digits starting with 0)

### Image Validation
- `image`: Optional, Base64 encoded image string
- Format: `data:image/{type};base64,{base64_string}`
- Recommended max size: 5MB

