# Verification API Endpoint

## Verify/Unverify Help Request

### Endpoint
```
PATCH /api/help-requests/:id/verify
```

### Base URL
- Development: `http://localhost:3000/api`
- Production: Set via `VITE_API_BASE_URL` environment variable

### Authentication Required
**YES** - This endpoint requires authentication. Only authenticated users can verify requests.

### Request

#### Method
`PATCH`

#### URL Parameters
- `id` (string, required) - The ID of the help request to verify/unverify

#### Headers
```
Content-Type: application/json
Authorization: Bearer <token>  // REQUIRED - JWT authentication token
```

#### Request Body
```json
{
  "verified": true,           // boolean, required - true to verify, false to unverify
  "verifiedBy": "admin123"    // string, optional - ID or name of the person verifying
}
```

### Response

#### Success Response (200 OK)
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
  "verifiedBy": "admin123"       // Who verified it
}
```

#### Error Responses

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

### Example Usage

#### Verify a Help Request
```javascript
// Frontend code (already implemented)
import { verifyHelpRequest } from './api.ts'

// Verify a request
await verifyHelpRequest('req_123456', true, 'admin123')

// Unverify a request
await verifyHelpRequest('req_123456', false, 'admin123')
```

#### cURL Example
```bash
# Verify a request
curl -X PATCH \
  http://localhost:3000/api/help-requests/req_123456/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verified": true,
    "verifiedBy": "admin123"
  }'

# Unverify a request
curl -X PATCH \
  http://localhost:3000/api/help-requests/req_123456/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verified": false,
    "verifiedBy": "admin123"
  }'
```

### Backend Implementation Notes

1. **Database Schema Update**: Add these fields to your HelpRequest model:
   - `verified` (Boolean, default: false)
   - `verifiedAt` (DateTime, nullable)
   - `verifiedBy` (String, nullable) - Should store user ID or username

2. **Authentication & Authorization**:
   - **REQUIRED**: Verify JWT token from `Authorization` header
   - Extract user information from token
   - Check if user has permission to verify requests (admin/manager role)
   - Use authenticated user's ID/name for `verifiedBy` field (don't trust client-provided value)

3. **Validation**:
   - Check if help request exists
   - Validate `verified` is a boolean
   - **Security**: Override `verifiedBy` with authenticated user's ID (don't trust client)
   - Set `verifiedAt` to current timestamp when verified

4. **Response**: Return the updated HelpRequest object with all fields

5. **Error Handling**: 
   - `401 Unauthorized` - Missing or invalid token
   - `403 Forbidden` - User doesn't have permission to verify
   - `404 Not Found` - Help request not found
   - `400 Bad Request` - Invalid request body

### Security Best Practices

1. **Never trust client-provided `verifiedBy`**:
   ```javascript
   // ❌ BAD - Don't do this
   verifiedBy: req.body.verifiedBy
   
   // ✅ GOOD - Use authenticated user
   verifiedBy: req.user.id  // or req.user.name
   ```

2. **Validate user permissions**:
   ```javascript
   // Only allow admin or manager roles
   if (req.user.role !== 'admin' && req.user.role !== 'manager') {
     return res.status(403).json({ error: 'Insufficient permissions' })
   }
   ```

3. **Log verification actions** for audit trail

### Updated HelpRequest Interface

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
  verified?: boolean          // NEW: Verification status
  verifiedAt?: string          // NEW: When it was verified
  verifiedBy?: string          // NEW: Who verified it
}
```

### Frontend Integration

The frontend automatically:
- Shows verification status in the help requests table
- Provides verify/unverify buttons
- Refreshes the table after verification
- Handles errors gracefully

No additional frontend changes needed - the feature is fully implemented!

