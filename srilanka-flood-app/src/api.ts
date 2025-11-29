// API Service for Backend Integration
const API_BASE_URL = 'http://localhost:3000/api'

// Types
export interface DisasterCenter {
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
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
}

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
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
}

export interface Statistics {
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

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  details?: any
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Log request for debugging (especially useful in production)
  console.log('API Request:', {
    method: options.method || 'GET',
    url,
    body: options.body ? JSON.parse(options.body as string) : null
  })

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    let errorData: any
    try {
      errorData = await response.json()
    } catch (e) {
      errorData = { 
        message: 'Unknown error', 
        error: response.statusText,
        status: response.status
      }
    }
    
    // Log detailed error for debugging
    console.error('API Error:', {
      url,
      method: options.method || 'GET',
      status: response.status,
      statusText: response.statusText,
      errorData,
      requestBody: options.body ? JSON.parse(options.body as string) : null
    })
    
    // Create a more detailed error message
    const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`
    const error = new Error(errorMessage)
    ;(error as any).status = response.status
    ;(error as any).data = errorData
    throw error
  }

  return response.json()
}

// Disaster Centers API
export async function fetchDisasterCenters(): Promise<DisasterCenter[]> {
  try {
    const response = await apiCall<PaginatedResponse<DisasterCenter> | DisasterCenter[]>('/disaster-centers')
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response)) {
      return response
    }
    return response.data || []
  } catch (error) {
    console.error('Error fetching disaster centers:', error)
    throw error
  }
}

export async function fetchDisasterCenterById(id: string): Promise<DisasterCenter> {
  return apiCall<DisasterCenter>(`/disaster-centers/${id}`)
}

export async function createDisasterCenter(center: Omit<DisasterCenter, 'id' | 'createdAt' | 'updatedAt'>): Promise<DisasterCenter> {
  return apiCall<DisasterCenter>('/disaster-centers', {
    method: 'POST',
    body: JSON.stringify(center),
  })
}

export async function updateDisasterCenter(id: string, center: Partial<DisasterCenter>): Promise<DisasterCenter> {
  return apiCall<DisasterCenter>(`/disaster-centers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(center),
  })
}

export async function patchDisasterCenter(id: string, updates: Partial<DisasterCenter>): Promise<DisasterCenter> {
  return apiCall<DisasterCenter>(`/disaster-centers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function deleteDisasterCenter(id: string): Promise<void> {
  await apiCall<void>(`/disaster-centers/${id}`, {
    method: 'DELETE',
  })
}

export async function searchDisasterCenters(query: string, filters?: { status?: string; services?: string[] }): Promise<DisasterCenter[]> {
  const params = new URLSearchParams({ q: query })
  if (filters?.status) params.append('status', filters.status)
  if (filters?.services) filters.services.forEach(s => params.append('services', s))
  
  const response = await apiCall<PaginatedResponse<DisasterCenter> | DisasterCenter[]>(`/disaster-centers/search?${params}`)
  if (Array.isArray(response)) {
    return response
  }
  return response.data || []
}

export async function findNearbyCenters(lat: number, lng: number, radius: number = 10): Promise<DisasterCenter[]> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radius.toString(),
  })
  
  const response = await apiCall<PaginatedResponse<DisasterCenter> | DisasterCenter[]>(`/disaster-centers/nearby?${params}`)
  if (Array.isArray(response)) {
    return response
  }
  return response.data || []
}

// Help Requests API
export async function fetchHelpRequests(params?: {
  limit?: number
  offset?: number
  status?: string
  urgencyLevel?: string
  assignedCenter?: string
  dateFrom?: string
  dateTo?: string
  sort?: string
  order?: 'asc' | 'desc'
}): Promise<{ data: HelpRequest[]; total: number; limit: number; offset: number }> {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.urgencyLevel) queryParams.append('urgencyLevel', params.urgencyLevel)
  if (params?.assignedCenter) queryParams.append('assignedCenter', params.assignedCenter)
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo)
  if (params?.sort) queryParams.append('sort', params.sort)
  if (params?.order) queryParams.append('order', params.order)

  const query = queryParams.toString()
  const endpoint = `/help-requests${query ? `?${query}` : ''}`
  
  const response = await apiCall<PaginatedResponse<HelpRequest> | { data: HelpRequest[]; total: number; limit: number; offset: number }>(endpoint)
  
  if ('pagination' in response) {
    return {
      data: response.data,
      total: response.pagination?.total || response.data.length,
      limit: response.pagination?.limit || params?.limit || 50,
      offset: response.pagination?.offset || params?.offset || 0,
    }
  }
  
  return response as { data: HelpRequest[]; total: number; limit: number; offset: number }
}

export async function fetchHelpRequestById(id: string): Promise<HelpRequest> {
  return apiCall<HelpRequest>(`/help-requests/${id}`)
}

export async function submitHelpRequest(request: Omit<HelpRequest, 'id' | 'timestamp' | 'status'>): Promise<HelpRequest> {
  return apiCall<HelpRequest>('/help-requests', {
    method: 'POST',
    body: JSON.stringify({
      ...request,
      timestamp: new Date().toISOString(),
    }),
  })
}

export async function updateHelpRequestStatus(id: string, status: string, assignedCenter?: string, notes?: string): Promise<HelpRequest> {
  return apiCall<HelpRequest>(`/help-requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, assignedCenter, notes }),
  })
}

export async function assignHelpRequest(id: string, assignedCenter: string, notes?: string): Promise<HelpRequest> {
  return apiCall<HelpRequest>(`/help-requests/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ assignedCenter, notes }),
  })
}

export async function updateHelpRequest(id: string, updates: Partial<HelpRequest>): Promise<HelpRequest> {
  return apiCall<HelpRequest>(`/help-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export async function deleteHelpRequest(id: string): Promise<void> {
  await apiCall<void>(`/help-requests/${id}`, {
    method: 'DELETE',
  })
}

// Statistics API
export async function fetchStatistics(): Promise<Statistics> {
  return apiCall<Statistics>('/statistics')
}

export async function fetchCenterStatistics(): Promise<any> {
  return apiCall<any>('/statistics/centers')
}

export async function fetchRequestStatistics(): Promise<any> {
  return apiCall<any>('/statistics/requests')
}

export async function fetchStatisticsTimeline(days: number = 7): Promise<any> {
  return apiCall<any>(`/statistics/timeline?days=${days}`)
}

// Image Upload API
export async function uploadImage(file: File, type: 'center' | 'verification'): Promise<{ url: string; id: string; size: number; type: string }> {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('type', type)

  const url = `${API_BASE_URL}/upload/image`
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export async function uploadImageBase64(base64String: string, type: 'center' | 'verification'): Promise<{ url: string; id: string; size: number; type: string }> {
  return apiCall<{ url: string; id: string; size: number; type: string }>('/upload/image/base64', {
    method: 'POST',
    body: JSON.stringify({ image: base64String, type }),
  })
}

export async function getImageById(id: string): Promise<any> {
  return apiCall<any>(`/images/${id}`)
}

export async function deleteImage(id: string): Promise<void> {
  await apiCall<void>(`/upload/image/${id}`, {
    method: 'DELETE',
  })
}

// Location Validation API
export async function validateLocation(lat: number, lng: number): Promise<{ valid: boolean; message: string }> {
  return apiCall<{ valid: boolean; message: string }>('/validate/location', {
    method: 'POST',
    body: JSON.stringify({ latitude: lat, longitude: lng }),
  })
}

export async function getSriLankaBounds(): Promise<{ north: number; south: number; east: number; west: number }> {
  return apiCall<{ north: number; south: number; east: number; west: number }>('/location/bounds')
}

export async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; formatted_address: string }> {
  return apiCall<{ address: string; formatted_address: string }>('/location/reverse-geocode', {
    method: "POST",
    body: JSON.stringify({ latitude: lat, longitude: lng }),
  })
}

export async function forwardGeocode(address: string): Promise<{ latitude: number; longitude: number }> {
  return apiCall<{ latitude: number; longitude: number }>('/location/geocode', {
    method: 'POST',
    body: JSON.stringify({ address }),
  })
}

// Verification API functions (works without authentication)
export async function verifyHelpRequest(id: string, verified: boolean = true, verifiedBy?: string): Promise<HelpRequest> {
  // Verification works without authentication - use 'anonymous' as default
  const verifiedByUser = verifiedBy || 'anonymous'
  
  const endpoint = `/help-requests/${id}/verify`
  const requestBody = { verified, verifiedBy: verifiedByUser }
  
  // Debug logging
  console.log('Verifying request:', { 
    id, 
    verified, 
    verifiedBy: verifiedByUser,
    endpoint, 
    apiBaseUrl: API_BASE_URL,
    fullUrl: `${API_BASE_URL}${endpoint}`,
    requestBody
  })
  
  try {
    return await apiCall<HelpRequest>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    })
  } catch (error: any) {
    console.error('Verification failed:', {
      id,
      verified,
      error: error.message,
      status: error.status,
      data: error.data
    })
    throw error
  }
}

export async function verifyDisasterCenter(id: string, verified: boolean = true, verifiedBy?: string): Promise<DisasterCenter> {
  // Verification works without authentication - use 'anonymous' as default
  const verifiedByUser = verifiedBy || 'anonymous'
  
  return apiCall<DisasterCenter>(`/disaster-centers/${id}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ verified, verifiedBy: verifiedByUser }),
  })
}

