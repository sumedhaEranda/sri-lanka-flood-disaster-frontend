// TypeScript Type Definitions

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

export interface FloodLandslideReport {
  id?: string
  type: 'flood' | 'landslide'
  location: string
  latitude: number
  longitude: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  reportedBy?: string
  phone?: string
  image?: string
  timestamp?: Date | string
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

