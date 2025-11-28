# Sri Lanka Flood Disaster App - Complete Features List

## 📋 Application Features Overview

### 1. Dashboard Features
- **Overview Section**
  - Interactive map showing all disaster centers
  - Statistics cards (Total Centers, Active Centers, Limited Capacity, Total Capacity)
  - Real-time center status indicators
  - Map markers with custom colors (Active=Green, Limited=Orange, Full=Red)
  - Info windows with center details, images, and additional information

- **Disaster Centers Section**
  - Searchable table of all disaster centers
  - Display columns: Name, Location, Phone, Capacity, Status, Services, Additional Information, Actions
  - Center images with thumbnail preview and full-size modal
  - View on map functionality
  - Call center directly from table
  - Filter by search term

- **Help Requests Section**
  - Display all submitted help requests
  - Show verification images
  - Request details: Name, Phone, Location, Number of People, Urgent Needs, Additional Info
  - Image preview with full-size modal

### 2. Help Request Form Features
- **Personal Information**
  - Full Name (required)
  - Phone Number (required, Sri Lankan format validation)
  
- **Location Selection**
  - Automatic GPS location detection
  - Manual map click selection
  - Draggable marker
  - Reverse geocoding (coordinates to address)
  - **Sri Lanka boundary restriction** - Only locations within Sri Lanka allowed
  - Location validation on selection

- **Assistance Details**
  - Number of people needing help (required)
  - Urgent needs checkboxes: Shelter, Food, Medical, Clothing, Transportation
  - Urgency level dropdown: Critical, Urgent, Moderate
  - Additional information textarea

- **Image Upload**
  - Verification image upload (optional)
  - Base64 encoding
  - Image preview
  - Remove image functionality
  - File type validation (images only)
  - File size validation (max 5MB)

- **Form Validation**
  - Required field validation
  - Phone number format validation (Sri Lankan)
  - Location must be within Sri Lanka bounds
  - At least one urgent need must be selected

### 3. Create Disaster Center Form Features
- **Basic Information**
  - Center Name (required)
  - Full Address (required)
  - Contact Phone (required, Sri Lankan format validation)

- **Capacity & Status**
  - Maximum Capacity (required)
  - Status selection: Active, Limited, Full

- **Services Offered**
  - Multi-select checkboxes: Shelter, Food, Medical, Clothing, Transportation
  - At least one service required

- **Location Selection**
  - Map-based location picker
  - Click to set location
  - Draggable marker
  - **Sri Lanka boundary restriction** - Only locations within Sri Lanka allowed
  - Location validation

- **Additional Information**
  - Optional textarea for additional details about the center

- **Image Upload**
  - Center image upload (optional)
  - Base64 encoding
  - Image preview
  - Remove image functionality
  - File validation

### 4. Language Support
- **Bilingual Interface**
  - English (en)
  - Sinhala (si)
  - Language switcher in sidebar
  - All UI text translated
  - Language preference saved in localStorage

### 5. Map Features
- **Google Maps Integration**
  - Interactive map with markers
  - Custom marker colors based on status
  - Info windows with center details
  - Image display in info windows
  - Map bounds restricted to Sri Lanka
  - Zoom controls
  - Center images in info windows

### 6. Data Management
- **Local Storage**
  - Disaster centers storage
  - Help requests storage
  - Language preference storage

### 7. Responsive Design
- **Mobile Support**
  - Collapsible sidebar menu
  - Touch-friendly interface
  - Responsive tables with horizontal scroll
  - Mobile-optimized forms
  - Hamburger menu for mobile

### 8. Validation & Security
- **Phone Number Validation**
  - Sri Lankan phone format: +94 XX XXXXXXX or 0XX XXXXXXX
  - Real-time validation feedback

- **Location Validation**
  - Coordinates must be within Sri Lanka bounds
  - Validation on map click
  - Validation on marker drag
  - Validation on form submission

- **Image Validation**
  - File type check (images only)
  - File size limit (5MB)
  - Base64 encoding for storage

## 🔌 Backend API Requirements

### Base URL
```
http://localhost:3000/api
```

### Required Endpoints

#### 1. Disaster Centers API
- `GET /api/disaster-centers` - Get all centers
- `GET /api/disaster-centers/:id` - Get center by ID
- `POST /api/disaster-centers` - Create new center
- `PUT /api/disaster-centers/:id` - Update center
- `DELETE /api/disaster-centers/:id` - Delete center
- `GET /api/disaster-centers/search?q=term` - Search centers

#### 2. Help Requests API
- `GET /api/help-requests` - Get all requests (with pagination)
- `GET /api/help-requests/:id` - Get request by ID
- `POST /api/help-requests` - Submit new request
- `PATCH /api/help-requests/:id/status` - Update request status
- `GET /api/help-requests?status=pending` - Filter by status

#### 3. Statistics API
- `GET /api/statistics` - Get dashboard statistics

#### 4. Image Upload API
- `POST /api/upload/image` - Upload image (returns URL)
- `DELETE /api/upload/image/:id` - Delete uploaded image

#### 5. Location Validation API
- `POST /api/validate/location` - Validate coordinates are within Sri Lanka

## 📊 Data Models

### DisasterCenter
```typescript
{
  id: string
  name: string
  address: string
  phone: string
  latitude: number
  longitude: number
  capacity: number
  services: string[]
  status: 'active' | 'full' | 'limited'
  image?: string // Base64 or URL
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
  urgencyLevel: string // 'critical' | 'urgent' | 'moderate'
  additionalInfo: string
  verificationImage?: string // Base64 or URL
  timestamp: Date
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
  lastUpdated: string
}
```

## 🔐 Validation Rules

### Phone Number
- Format: `+94 XX XXXXXXX` or `0XX XXXXXXX`
- Regex: `/^(?:\+94|0)(?:11|2[1-8]|3[1-8]|4[1-8]|5[1-7]|6[3-7]|81|91)\d{7}$/`

### Location (Sri Lanka Bounds)
- Latitude: 5.9° to 9.8°
- Longitude: 79.7° to 81.9°

### Image
- Max size: 5MB
- Allowed types: image/* (JPG, PNG, WEBP, etc.)
- Storage: Base64 or URL

## 🎨 UI Features
- Modern, clean interface
- Color-coded status indicators
- Image modals for full-size viewing
- Smooth animations
- Loading states
- Error messages
- Success notifications
- Responsive design for all screen sizes

