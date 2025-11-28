# Verify Help Request API

## Endpoint
```
PATCH /api/help-requests/:id/verify
```

## Base URL
- Development: `http://localhost:3000/api`
- Production: Set via `VITE_API_BASE_URL` environment variable

## Authentication
**NOT REQUIRED** - Verification works without login (uses "anonymous" if not logged in)

## Request

### Method
`PATCH`

### URL Parameters
- `id` (string, required) - The ID of the help request to verify/unverify

### Headers
```
Content-Type: application/json
Authorization: Bearer <token>  // Optional - Token is sent if user is logged in
```

### Request Body
```json
{
  "verified": true,           // boolean, required - true to verify, false to unverify
  "verifiedBy": "anonymous"   // string, optional - ID or name of the person verifying
}
```

## Response

### Success Response (200 OK)
```json
{
  "id": "req_123456",
  "name": "John Doe",
  "phone": "0765395632",
  "location": "Colombo",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "numberOfPeople": 3,
  "urgentNeeds": ["Food", "Shelter"],
  "urgencyLevel": "urgent",
  "additionalInfo": "Family with children",
  "verificationImage": "data:image/jpeg;base64,...",
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "pending",
  "assignedCenter": null,
  "verified": true,              // Updated verification status
  "verifiedAt": "2024-01-15T11:00:00Z",  // Timestamp when verified
  "verifiedBy": "anonymous"      // Who verified it
}
```

### Error Responses

**400 Bad Request**
```json
{
  "error": "Invalid request body",
  "message": "verified field is required"
}
```

**404 Not Found**
```json
{
  "error": "Help request not found",
  "message": "Help request with id 'req_123456' does not exist"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "message": "Failed to update verification status"
}
```

## Examples

### cURL - Verify Request
```bash
curl -X PATCH \
  http://localhost:3000/api/help-requests/req_123456/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verified": true,
    "verifiedBy": "anonymous"
  }'
```

### cURL - Unverify Request
```bash
curl -X PATCH \
  http://localhost:3000/api/help-requests/req_123456/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verified": false,
    "verifiedBy": "anonymous"
  }'
```

### JavaScript/Frontend
```javascript
import { verifyHelpRequest } from './api.ts'

// Verify a request
await verifyHelpRequest('req_123456', true, 'anonymous')

// Unverify a request
await verifyHelpRequest('req_123456', false, 'anonymous')
```

### Backend Implementation (Express.js)
```javascript
router.patch('/help-requests/:id/verify', async (req, res) => {
  try {
    const { verified } = req.body
    const verifiedBy = req.body.verifiedBy || 'anonymous'
    
    const helpRequest = await HelpRequest.findById(req.params.id)
    
    if (!helpRequest) {
      return res.status(404).json({ 
        error: 'Help request not found',
        message: `Help request with id '${req.params.id}' does not exist`
      })
    }
    
    // Update verification
    helpRequest.verified = verified
    helpRequest.verifiedBy = verifiedBy
    helpRequest.verifiedAt = verified ? new Date() : null
    
    await helpRequest.save()
    
    res.json(helpRequest)
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
})
```

## Database Schema

Add these fields to your HelpRequest model:

```javascript
{
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: String,
    default: null
  }
}
```

## HelpRequest Interface

```typescript
export interface HelpRequest {
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
  verified?: boolean          // Verification status
  verifiedAt?: string          // When it was verified
  verifiedBy?: string          // Who verified it
}
```

