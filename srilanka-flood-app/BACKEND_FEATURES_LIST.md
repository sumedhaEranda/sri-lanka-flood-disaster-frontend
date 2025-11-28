# Backend Implementation Features List

## 🎯 Core Backend Features to Implement

### 1. Disaster Centers Management

#### 1.1 CRUD Operations
- ✅ **GET /api/disaster-centers** - List all centers with pagination
- ✅ **GET /api/disaster-centers/:id** - Get single center by ID
- ✅ **POST /api/disaster-centers** - Create new center
- ✅ **PUT /api/disaster-centers/:id** - Update center (full update)
- ✅ **PATCH /api/disaster-centers/:id** - Partial update center
- ✅ **DELETE /api/disaster-centers/:id** - Delete center

#### 1.2 Search & Filter
- ✅ **GET /api/disaster-centers/search** - Search by name/address
- ✅ **GET /api/disaster-centers?status=active** - Filter by status
- ✅ **GET /api/disaster-centers?services=Shelter** - Filter by services
- ✅ **GET /api/disaster-centers?location=lat,lng&radius=km** - Find centers near location

#### 1.3 Validation Rules
- Phone number: Sri Lankan format validation
- Location: Must be within Sri Lanka bounds (lat: 5.9-9.8, lng: 79.7-81.9)
- Services: At least one service required
- Required fields: name, address, phone, latitude, longitude, capacity, services, status

### 2. Help Requests Management

#### 2.1 CRUD Operations
- ✅ **GET /api/help-requests** - List all requests with pagination
- ✅ **GET /api/help-requests/:id** - Get single request by ID
- ✅ **POST /api/help-requests** - Submit new help request
- ✅ **PATCH /api/help-requests/:id** - Update request
- ✅ **DELETE /api/help-requests/:id** - Delete request (admin only)

#### 2.2 Status Management
- ✅ **PATCH /api/help-requests/:id/status** - Update request status
- ✅ **GET /api/help-requests?status=pending** - Filter by status
- ✅ **POST /api/help-requests/:id/assign** - Assign request to center

#### 2.3 Filtering & Sorting
- ✅ **GET /api/help-requests?urgencyLevel=critical** - Filter by urgency
- ✅ **GET /api/help-requests?assignedCenter=dc1** - Filter by assigned center
- ✅ **GET /api/help-requests?sort=timestamp&order=desc** - Sort requests
- ✅ **GET /api/help-requests?dateFrom=2024-01-01&dateTo=2024-01-31** - Date range filter

#### 2.4 Validation Rules
- Phone number: Sri Lankan format validation
- Location: Must be within Sri Lanka bounds
- UrgentNeeds: At least one must be selected
- UrgencyLevel: Must be "critical", "urgent", or "moderate"
- Required fields: name, phone, location, latitude, longitude, numberOfPeople, urgentNeeds, urgencyLevel

### 3. Statistics & Analytics

#### 3.1 Dashboard Statistics
- ✅ **GET /api/statistics** - Get overall statistics
- ✅ **GET /api/statistics/centers** - Center-specific statistics
- ✅ **GET /api/statistics/requests** - Request-specific statistics
- ✅ **GET /api/statistics/timeline?days=7** - Statistics over time

#### 3.2 Metrics
- Total centers count
- Active/Limited/Full centers count
- Total capacity
- Help requests count (total, pending, processing, completed)
- Urgency level breakdown
- Requests by center
- Requests by location/region

### 4. Image Management

#### 4.1 Upload & Storage
- ✅ **POST /api/upload/image** - Upload image (multipart/form-data)
- ✅ **GET /api/images/:id** - Get image by ID
- ✅ **DELETE /api/images/:id** - Delete image
- ✅ **POST /api/upload/image/base64** - Upload Base64 image

#### 4.2 Image Processing
- Image validation (type, size max 5MB)
- Image optimization/resizing
- Thumbnail generation
- Storage: Local filesystem or cloud storage (S3, Cloudinary, etc.)

### 5. Location Services

#### 5.1 Validation
- ✅ **POST /api/validate/location** - Validate coordinates within Sri Lanka
- ✅ **GET /api/location/bounds** - Get Sri Lanka boundary coordinates

#### 5.2 Geocoding
- ✅ **POST /api/location/reverse-geocode** - Coordinates to address
- ✅ **POST /api/location/geocode** - Address to coordinates
- Integration with Google Maps Geocoding API

#### 5.3 Proximity Search
- ✅ **GET /api/disaster-centers/nearby?lat=6.9271&lng=79.8612&radius=10** - Find centers within radius

### 6. Authentication & Authorization (Optional)

#### 6.1 User Management
- **POST /api/auth/register** - Register new admin user
- **POST /api/auth/login** - Login user
- **POST /api/auth/logout** - Logout user
- **POST /api/auth/refresh** - Refresh access token
- **GET /api/auth/me** - Get current user info

#### 6.2 Roles & Permissions
- Admin: Full access (CRUD all)
- Manager: Read all, update assigned
- Viewer: Read only

### 7. Notification System (Optional)

#### 7.1 Notifications
- **POST /api/notifications** - Create notification
- **GET /api/notifications** - Get user notifications
- **PATCH /api/notifications/:id/read** - Mark as read
- **DELETE /api/notifications/:id** - Delete notification

#### 7.2 Email/SMS Integration
- Send email when help request submitted
- Send SMS to center when request assigned
- Email notifications for status updates

### 8. Reporting & Export

#### 8.1 Reports
- **GET /api/reports/centers** - Centers report (PDF/Excel)
- **GET /api/reports/requests** - Requests report
- **GET /api/reports/daily** - Daily summary report

#### 8.2 Data Export
- **GET /api/export/centers?format=csv** - Export centers to CSV
- **GET /api/export/requests?format=json** - Export requests to JSON

### 9. Audit & Logging

#### 9.1 Activity Logs
- Log all CRUD operations
- Log user actions
- Log API access
- **GET /api/audit-logs** - Get audit logs

### 10. API Features

#### 10.1 Pagination
- All list endpoints support pagination
- Query params: `limit`, `offset`, `page`, `pageSize`
- Response includes: `total`, `limit`, `offset`, `hasMore`

#### 10.2 Error Handling
- Standardized error responses
- Validation error details
- HTTP status codes: 200, 201, 400, 401, 403, 404, 500

#### 10.3 Rate Limiting
- Rate limit per IP/user
- Configurable limits
- Rate limit headers in response

#### 10.4 CORS Configuration
- Allow frontend origin
- Configure allowed methods and headers

#### 10.5 Request Validation
- Input validation middleware
- Sanitization
- Type checking

## 📊 Database Schema Requirements

### DisasterCenters Table
```sql
- id (Primary Key, UUID/String)
- name (String, Required)
- address (String, Required)
- phone (String, Required, Unique)
- latitude (Decimal, Required)
- longitude (Decimal, Required)
- capacity (Integer, Required)
- services (JSON Array, Required)
- status (Enum: active/limited/full, Required)
- image (String/URL, Optional)
- additionalInfo (Text, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### HelpRequests Table
```sql
- id (Primary Key, UUID/String)
- name (String, Required)
- phone (String, Required)
- location (String, Required)
- latitude (Decimal, Optional)
- longitude (Decimal, Optional)
- numberOfPeople (Integer, Required)
- urgentNeeds (JSON Array, Required)
- urgencyLevel (Enum: critical/urgent/moderate, Required)
- additionalInfo (Text, Optional)
- verificationImage (String/URL, Optional)
- status (Enum: pending/processing/completed, Default: pending)
- assignedCenter (Foreign Key, Optional)
- timestamp (DateTime, Default: Now)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Images Table (Optional)
```sql
- id (Primary Key, UUID/String)
- url (String, Required)
- type (Enum: center/verification)
- relatedId (String, Required)
- size (Integer)
- mimeType (String)
- createdAt (DateTime)
```

## 🔧 Technology Stack Recommendations

### Backend Framework Options
1. **Node.js + Express** - JavaScript/TypeScript
2. **Python + FastAPI** - Python
3. **Java + Spring Boot** - Java
4. **PHP + Laravel** - PHP
5. **Go + Gin** - Go

### Database Options
1. **PostgreSQL** - Recommended (supports JSON, geographic data)
2. **MySQL** - Good alternative
3. **MongoDB** - NoSQL option
4. **SQLite** - For development/testing

### Image Storage Options
1. **Local Filesystem** - Simple, for development
2. **AWS S3** - Production ready
3. **Cloudinary** - Image optimization included
4. **Google Cloud Storage** - Alternative cloud option

### Additional Services
- **Redis** - Caching, rate limiting
- **JWT** - Authentication tokens
- **Nodemailer/SendGrid** - Email service
- **Twilio** - SMS service

## 📝 Implementation Priority

### Phase 1: Core Features (Must Have)
1. Disaster Centers CRUD
2. Help Requests CRUD
3. Basic validation
4. Statistics endpoint
5. Image upload (Base64)

### Phase 2: Enhanced Features (Should Have)
1. Search and filtering
2. Location validation
3. Proximity search
4. Image file upload
5. Pagination

### Phase 3: Advanced Features (Nice to Have)
1. Authentication
2. Notifications
3. Reporting
4. Audit logs
5. Export functionality

## 🧪 Testing Requirements

### Unit Tests
- Validation functions
- Business logic
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- External service integration

### Test Data
- Sample disaster centers
- Sample help requests
- Edge cases

## 📋 API Response Standards

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human readable error message",
  "details": { ... }
}
```

### Pagination Response Format
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

## 🔐 Security Considerations

1. **Input Validation** - Validate all inputs
2. **SQL Injection Prevention** - Use parameterized queries
3. **XSS Prevention** - Sanitize user inputs
4. **CORS Configuration** - Restrict origins
5. **Rate Limiting** - Prevent abuse
6. **Image Validation** - Check file types and sizes
7. **Location Validation** - Verify coordinates
8. **Phone Validation** - Prevent invalid numbers

## 📈 Performance Optimization

1. **Database Indexing** - Index frequently queried fields
2. **Caching** - Cache statistics and frequently accessed data
3. **Image Optimization** - Compress and resize images
4. **Pagination** - Limit result sets
5. **Connection Pooling** - Optimize database connections

