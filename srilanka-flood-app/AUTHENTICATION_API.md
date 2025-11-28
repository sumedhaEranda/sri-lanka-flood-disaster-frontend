# Authentication API for Verification

## Overview
To verify help requests, users must be authenticated. This document describes the authentication system.

## Authentication Endpoints

### 1. Login

#### Endpoint
```
POST /api/auth/login
```

#### Request Body
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### 2. Get Current User

#### Endpoint
```
GET /api/auth/me
```

#### Headers
```
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "id": "user_123",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin"
}
```

### 3. Logout

#### Endpoint
```
POST /api/auth/logout
```

#### Headers
```
Authorization: Bearer <token>
```

#### Response (200 OK)
```json
{
  "message": "Logged out successfully"
}
```

## Frontend Usage

### Login Example
```typescript
import { login } from './api.ts'

// Login user
const { token, user } = await login('admin@example.com', 'password123')
// Token and user are automatically stored in localStorage
```

### Check Authentication
```typescript
import { isAuthenticated, getCurrentUser } from './api.ts'

// Check if user is logged in
if (isAuthenticated()) {
  const user = getCurrentUser()
  console.log('Current user:', user)
}
```

### Verify Request (with authentication)
```typescript
import { verifyHelpRequest, getCurrentUser } from './api.ts'

// Get current user
const user = getCurrentUser()

// Verify request (user info is automatically included)
await verifyHelpRequest('req_123', true, user?.id)
```

## Backend Implementation

### JWT Token Structure
```json
{
  "userId": "user_123",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Middleware Example (Express.js)
```javascript
const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}
```

### Verify Endpoint with Authentication
```javascript
router.patch('/help-requests/:id/verify', authenticateToken, async (req, res) => {
  try {
    // Get authenticated user from token (not from request body!)
    const userId = req.user.userId
    const userName = req.user.name || req.user.email
    
    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    const { verified } = req.body
    const helpRequest = await HelpRequest.findById(req.params.id)
    
    if (!helpRequest) {
      return res.status(404).json({ error: 'Help request not found' })
    }
    
    // Update verification (use authenticated user, not client-provided)
    helpRequest.verified = verified
    helpRequest.verifiedBy = userId  // Use authenticated user ID
    helpRequest.verifiedAt = verified ? new Date() : null
    
    await helpRequest.save()
    
    res.json(helpRequest)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

## User Roles

- **admin**: Full access, can verify/unverify any request
- **manager**: Can verify/unverify requests
- **viewer**: Read-only access, cannot verify

## Security Checklist

- ✅ JWT tokens expire after reasonable time (e.g., 24 hours)
- ✅ Tokens stored securely (httpOnly cookies recommended for production)
- ✅ Password hashed with bcrypt or similar
- ✅ Rate limiting on login endpoint
- ✅ CORS properly configured
- ✅ HTTPS in production
- ✅ Never trust client-provided user IDs
- ✅ Always validate user permissions server-side

