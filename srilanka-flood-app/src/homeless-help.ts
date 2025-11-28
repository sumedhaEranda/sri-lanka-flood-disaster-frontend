import { t, getCurrentLanguage } from './i18n.ts'
import { submitHelpRequest } from './api.ts'
import { formatPhoneNumber, validatePhoneNumber } from './phone-formatter.ts'

// Declare Google Maps
declare const google: any

export interface HelpRequest {
  name: string
  phone: string
  location: string
  latitude?: number
  longitude?: number
  numberOfPeople: number
  urgentNeeds: string[]
  urgencyLevel: string
  additionalInfo: string
  verificationImage?: string // Base64 encoded image
  timestamp: Date
}

let helpFormMap: any = null
let helpFormMarker: any = null

// Sri Lanka boundaries
const SRI_LANKA_BOUNDS = {
  north: 9.8,
  south: 5.9,
  east: 81.9,
  west: 79.7
}

// Check if coordinates are within Sri Lanka
function isWithinSriLanka(lat: number, lng: number): boolean {
  return lat >= SRI_LANKA_BOUNDS.south && 
         lat <= SRI_LANKA_BOUNDS.north && 
         lng >= SRI_LANKA_BOUNDS.west && 
         lng <= SRI_LANKA_BOUNDS.east
}

export function createHomelessHelpForm(): string {
  const tr = t()
  
  return `
    <div class="form-container">
      <div class="form-header">
        <h1 data-i18n="helpForm.title">${tr.helpForm.title}</h1>
        <p class="subtitle" data-i18n="helpForm.subtitle">${tr.helpForm.subtitle}</p>
      </div>
      
      <form id="help-request-form" class="help-form">
        <div class="form-group">
          <label for="name" data-i18n="helpForm.name">${tr.helpForm.name} *</label>
          <input type="text" id="name" name="name" required placeholder="${tr.helpForm.namePlaceholder || 'Enter your full name'}" autocomplete="name">
        </div>
        
        <div class="form-group">
          <label for="phone" data-i18n="helpForm.phone">${tr.helpForm.phone} *</label>
          <input type="tel" id="phone" name="phone" required placeholder="${tr.helpForm.phonePlaceholder || '0XXXXXXXXX (e.g., 0765367297)'}" autocomplete="tel">
        </div>
        
        <div class="form-group">
          <label for="location" data-i18n="helpForm.location">${tr.helpForm.location} *</label>
          <div class="location-input-group">
            <input type="text" id="location" name="location" required placeholder="${tr.helpForm.locationDetecting}">
            <button type="button" id="get-location-btn" class="get-location-btn">
              <span>📍</span>
              <span data-i18n="helpForm.getLocation">${tr.helpForm.getLocation}</span>
            </button>
          </div>
          <div id="location-status" class="location-status"></div>
          <div id="help-form-map" class="map-container"></div>
          <p class="map-instruction" data-i18n="helpForm.locationDetecting">${tr.helpForm.locationDetecting}</p>
          <input type="hidden" id="latitude" name="latitude">
          <input type="hidden" id="longitude" name="longitude">
        </div>
        
        <div class="form-group">
          <label for="numberOfPeople" data-i18n="helpForm.numberOfPeople">${tr.helpForm.numberOfPeople} *</label>
          <input type="number" id="numberOfPeople" name="numberOfPeople" min="1" max="100" required placeholder="${tr.helpForm.numberOfPeoplePlaceholder || 'How many people need help?'}">
        </div>
        
        <div class="form-group">
          <label data-i18n="helpForm.urgentNeeds">${tr.helpForm.urgentNeeds} *</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" name="urgentNeeds" value="shelter">
              <span data-i18n="helpForm.shelter">${tr.helpForm.shelter}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="urgentNeeds" value="food">
              <span data-i18n="helpForm.food">${tr.helpForm.food}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="urgentNeeds" value="medical">
              <span data-i18n="helpForm.medical">${tr.helpForm.medical}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="urgentNeeds" value="clothing">
              <span data-i18n="helpForm.clothing">${tr.helpForm.clothing}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="urgentNeeds" value="transportation">
              <span data-i18n="helpForm.transportation">${tr.helpForm.transportation}</span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label for="urgencyLevel" data-i18n="helpForm.urgencyLevel">${tr.helpForm.urgencyLevel || 'Urgency Level'} *</label>
          <select id="urgencyLevel" name="urgencyLevel" required>
            <option value="">Select urgency level</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="moderate">Moderate</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="additionalInfo" data-i18n="helpForm.additionalInfo">${tr.helpForm.additionalInfo}</label>
          <textarea id="additionalInfo" name="additionalInfo" rows="4" placeholder="${tr.helpForm.additionalInfoPlaceholder || 'Additional information...'}"></textarea>
        </div>
        
        <div class="form-group">
          <label for="verification-image" class="image-upload-label">
            <span>📷</span>
            <span data-i18n="helpForm.verificationImage">Upload Image for Verification (Sri Lanka Flood Disaster)</span>
            <span class="optional-badge">(Optional)</span>
          </label>
          <div class="image-upload-container">
            <input type="file" id="verification-image" name="verification-image" accept="image/*" class="image-input">
            <div class="image-preview-container" id="image-preview-container" style="display: none;">
              <img id="image-preview" class="image-preview" alt="Verification Image Preview">
              <button type="button" class="remove-image-btn" id="remove-image-btn">✕</button>
            </div>
          </div>
        </div>
        
        <button type="submit" class="submit-btn" data-i18n="helpForm.submit">${tr.helpForm.submit}</button>
      </form>
      
      <div id="loading-overlay" class="loading-overlay hidden">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text" id="loading-text">සුරකිමින්...</p>
        </div>
      </div>
      
      <div id="success-message" class="message success-message hidden">
        <h2 data-i18n="helpForm.success">✅ ${tr.helpForm.success}</h2>
        <p data-i18n="helpForm.successMessage">${tr.helpForm.successMessage}</p>
        <p class="emergency-contact" data-i18n="helpForm.emergencyContact">${tr.helpForm.emergencyContact}</p>
      </div>
      
      <div id="error-message" class="message error-message hidden">
        <h2 data-i18n="helpForm.error">❌ ${tr.helpForm.error}</h2>
        <p data-i18n="helpForm.errorMessage">${tr.helpForm.errorMessage}</p>
      </div>
    </div>
  `
}

export function setupHomelessHelpForm(container: HTMLElement): void {
  const form = container.querySelector<HTMLFormElement>('#help-request-form')
  const successMessage = container.querySelector<HTMLDivElement>('#success-message')
  const errorMessage = container.querySelector<HTMLDivElement>('#error-message')
  const mapContainer = container.querySelector<HTMLDivElement>('#help-form-map')
  const locationInput = container.querySelector<HTMLInputElement>('#location')
  const locationStatus = container.querySelector<HTMLDivElement>('#location-status')
  const latitudeInput = container.querySelector<HTMLInputElement>('#latitude')
  const longitudeInput = container.querySelector<HTMLInputElement>('#longitude')
  const getLocationBtn = container.querySelector<HTMLButtonElement>('#get-location-btn')
  const phoneInput = container.querySelector<HTMLInputElement>('#phone')
  
  if (!form) return
  
  // Phone number formatting
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement
      const cursorPosition = input.selectionStart || 0
      const oldValue = input.value
      const newValue = formatPhoneNumber(input.value)
      
      // Only update if value changed
      if (oldValue !== newValue) {
        input.value = newValue
        // Restore cursor position (approximate)
        const cursorOffset = newValue.length - oldValue.length
        const newPosition = Math.max(0, Math.min(newValue.length, cursorPosition + cursorOffset))
        input.setSelectionRange(newPosition, newPosition)
      }
    })
  }
  
  // Initialize map with error handling
  if (mapContainer) {
    if (typeof google !== 'undefined' && google.maps) {
      initializeHelpFormMap(mapContainer, locationInput, locationStatus, latitudeInput, longitudeInput)
    } else if ((window as any).googleMapsError) {
      showHelpFormMapError(mapContainer)
    } else {
      // Wait for Google Maps to load
      let attempts = 0
      const maxAttempts = 50
      
      const checkGoogleMaps = setInterval(() => {
        attempts++
        
        if ((window as any).googleMapsError) {
          clearInterval(checkGoogleMaps)
          showHelpFormMapError(mapContainer)
        } else if (typeof google !== 'undefined' && google.maps) {
          clearInterval(checkGoogleMaps)
          initializeHelpFormMap(mapContainer, locationInput, locationStatus, latitudeInput, longitudeInput)
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogleMaps)
          showHelpFormMapError(mapContainer)
        }
      }, 100)
      
      window.addEventListener('googlemapsloaded', () => {
        clearInterval(checkGoogleMaps)
        if (mapContainer && typeof google !== 'undefined' && google.maps) {
          initializeHelpFormMap(mapContainer, locationInput, locationStatus, latitudeInput, longitudeInput)
        }
      }, { once: true })
      
      window.addEventListener('googlemapserror', () => {
        clearInterval(checkGoogleMaps)
        showHelpFormMapError(mapContainer)
      }, { once: true })
    }
  }
  
  // Get location button
  if (getLocationBtn) {
    getLocationBtn.addEventListener('click', () => {
      getCurrentLocation(locationInput, locationStatus, latitudeInput, longitudeInput, getLocationBtn)
    })
  }
  
  // Automatically get location on form load
  if (navigator.geolocation) {
    getCurrentLocation(locationInput, locationStatus, latitudeInput, longitudeInput, getLocationBtn, true)
  }
  
  // Image upload handling
  const imageInput = container.querySelector<HTMLInputElement>('#verification-image')
  const imagePreview = container.querySelector<HTMLImageElement>('#image-preview')
  const imagePreviewContainer = container.querySelector<HTMLDivElement>('#image-preview-container')
  const removeImageBtn = container.querySelector<HTMLButtonElement>('#remove-image-btn')
  let verificationImageBase64: string | undefined = undefined

  if (imageInput && imagePreview && imagePreviewContainer && removeImageBtn) {
    imageInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          imageInput.value = ''
          return
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB')
          imageInput.value = ''
          return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          verificationImageBase64 = result
          if (imagePreview) {
            imagePreview.src = result
            imagePreviewContainer.style.display = 'block'
          }
        }
        reader.readAsDataURL(file)
      }
    })

    removeImageBtn.addEventListener('click', () => {
      verificationImageBase64 = undefined
      if (imageInput) imageInput.value = ''
      if (imagePreview) imagePreview.src = ''
      if (imagePreviewContainer) imagePreviewContainer.style.display = 'none'
    })
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const loadingOverlay = container.querySelector<HTMLDivElement>('#loading-overlay')
    const loadingText = container.querySelector<HTMLParagraphElement>('#loading-text')
    const submitBtn = form.querySelector<HTMLButtonElement>('.submit-btn')
    
    if (successMessage) successMessage.classList.add('hidden')
    if (errorMessage) errorMessage.classList.add('hidden')
    
    // Show loading screen
    if (loadingOverlay) loadingOverlay.classList.remove('hidden')
    if (loadingText) {
      loadingText.textContent = getCurrentLanguage() === 'si' ? 'සුරකිමින්...' : 'Saving...'
    }
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.style.opacity = '0.6'
      submitBtn.style.cursor = 'not-allowed'
    }
    
    const formData = new FormData(form)
    const urgentNeeds = form.querySelectorAll<HTMLInputElement>('input[name="urgentNeeds"]:checked')
    const latitude = formData.get('latitude') as string
    const longitude = formData.get('longitude') as string
    
    // Validate phone number
    const phone = (formData.get('phone') as string).trim()
    if (!validatePhoneNumber(phone)) {
      const tr = t()
      alert(tr.helpForm.phone + ' - ' + (tr.helpForm.phoneInvalid || 'Please enter a valid Sri Lankan phone number.'))
      if (phoneInput) phoneInput.focus()
      return
    }
    
    const helpRequest: HelpRequest = {
      name: formData.get('name') as string,
      phone: phone,
      location: formData.get('location') as string,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      numberOfPeople: parseInt(formData.get('numberOfPeople') as string),
      urgentNeeds: Array.from(urgentNeeds).map(cb => cb.value),
      urgencyLevel: formData.get('urgencyLevel') as string,
      additionalInfo: formData.get('additionalInfo') as string,
      verificationImage: verificationImageBase64,
      timestamp: new Date()
    }
    
    if (helpRequest.urgentNeeds.length === 0) {
      const tr = t()
      alert(tr.helpForm.urgentNeeds + ' - ' + 'Please select at least one')
      return
    }
    
    if (!latitude || !longitude) {
      const tr = t()
      alert(tr.helpForm.location + ' - ' + 'Please set your location on the map')
      return
    }

    // Validate location is within Sri Lanka
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (!isWithinSriLanka(lat, lng)) {
      const tr = t()
      alert(tr.helpForm.locationError || 'Location must be within Sri Lanka. Please select a location inside Sri Lanka.')
      return
    }
    
    try {
      await submitToDisasterCenter(helpRequest)
      
      // Hide loading screen
      if (loadingOverlay) loadingOverlay.classList.add('hidden')
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.style.opacity = '1'
        submitBtn.style.cursor = 'pointer'
      }
      
      if (successMessage) {
        successMessage.classList.remove('hidden')
        form.reset()
        if (helpFormMarker) {
          helpFormMarker.setMap(null)
          helpFormMarker = null
        }
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    } catch (error) {
      console.error('Error submitting help request:', error)
      
      // Hide loading screen
      if (loadingOverlay) loadingOverlay.classList.add('hidden')
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.style.opacity = '1'
        submitBtn.style.cursor = 'pointer'
      }
      
      if (errorMessage) {
        errorMessage.classList.remove('hidden')
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  })
}

// Show map error for help form
function showHelpFormMapError(mapContainer: HTMLDivElement): void {
  mapContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 1.5rem; text-align: center; background: #f8f9fa; border-radius: 8px; border: 2px dashed #dee2e6;">
      <div style="font-size: 2rem; margin-bottom: 0.75rem;">📍</div>
      <p style="color: #6c757d; margin: 0; font-size: 0.9rem;">Map unavailable. You can still enter your location manually.</p>
    </div>
  `
}

// Initialize map for help form
function initializeHelpFormMap(
  mapContainer: HTMLDivElement,
  locationInput: HTMLInputElement | null,
  locationStatus: HTMLDivElement | null,
  latitudeInput: HTMLInputElement | null,
  longitudeInput: HTMLInputElement | null
): void {
  try {
    if (mapContainer.hasChildNodes()) {
      mapContainer.innerHTML = ''
    }

    if (typeof google === 'undefined' || !google.maps) {
      showHelpFormMapError(mapContainer)
      return
    }

    // Set Sri Lanka bounds
    const sriLankaBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(SRI_LANKA_BOUNDS.south, SRI_LANKA_BOUNDS.west),
      new google.maps.LatLng(SRI_LANKA_BOUNDS.north, SRI_LANKA_BOUNDS.east)
    )

    helpFormMap = new google.maps.Map(mapContainer, {
      center: { lat: 7.8731, lng: 80.7718 },
      zoom: 8,
      mapTypeId: 'roadmap',
      restriction: {
        latLngBounds: sriLankaBounds,
        strictBounds: false
      },
      minZoom: 7,
      maxZoom: 18
    })

    // Restrict map to Sri Lanka bounds
    helpFormMap.setOptions({
      restriction: {
        latLngBounds: sriLankaBounds,
        strictBounds: false
      }
    })

    // Add click listener to map
    helpFormMap.addListener('click', (e: any) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      
      // Validate location is within Sri Lanka
      if (!isWithinSriLanka(lat, lng)) {
        const tr = t()
        showLocationStatus(locationStatus, tr.helpForm.locationError || 'Location must be within Sri Lanka. Please select a location inside Sri Lanka.', 'error')
        return
      }
      
      updateLocationFromCoordinates(lat, lng, locationInput, locationStatus, latitudeInput, longitudeInput)
    })
  } catch (error) {
    console.error('Error initializing help form map:', error)
    showHelpFormMapError(mapContainer)
  }
}

// Get current location
async function getCurrentLocation(
  locationInput: HTMLInputElement | null,
  locationStatus: HTMLDivElement | null,
  latitudeInput: HTMLInputElement | null,
  longitudeInput: HTMLInputElement | null,
  button: HTMLButtonElement | null,
  autoLoad: boolean = false
): Promise<void> {
  if (!navigator.geolocation) {
    showLocationStatus(locationStatus, 'Geolocation is not supported by your browser.', 'error')
    return
  }

  if (button && !autoLoad) {
    button.disabled = true
    button.innerHTML = '<span>⏳</span> <span>Getting Location...</span>'
  }

  showLocationStatus(locationStatus, 'Getting your location...', 'loading')

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })

    const { latitude, longitude } = position.coords
    
    // Validate location is within Sri Lanka
    if (!isWithinSriLanka(latitude, longitude)) {
      const tr = t()
      showLocationStatus(locationStatus, tr.helpForm.locationError || 'Your location is outside Sri Lanka. Please click on the map to select a location within Sri Lanka.', 'error')
      if (button && !autoLoad) {
        button.disabled = false
        button.innerHTML = '<span>📍</span> <span>Get My Location</span>'
      }
      return
    }
    
    await updateLocationFromCoordinates(latitude, longitude, locationInput, locationStatus, latitudeInput, longitudeInput)
  } catch (error) {
    console.error('Error getting location:', error)
    let errorMessage = 'Unable to get your location. Please click on the map to set your location.'
    
    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please allow location access or click on the map to set your location.'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable. Please click on the map to set your location.'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please click on the map to set your location.'
          break
      }
    }
    
    showLocationStatus(locationStatus, errorMessage, 'error')
  } finally {
    if (button && !autoLoad) {
      button.disabled = false
      button.innerHTML = '<span>📍</span> <span>Get My Location</span>'
    }
  }
}

// Update location from coordinates
async function updateLocationFromCoordinates(
  latitude: number,
  longitude: number,
  locationInput: HTMLInputElement | null,
  locationStatus: HTMLDivElement | null,
  latitudeInput: HTMLInputElement | null,
  longitudeInput: HTMLInputElement | null
): Promise<void> {
  if (latitudeInput) latitudeInput.value = latitude.toString()
  if (longitudeInput) longitudeInput.value = longitude.toString()

  // Update map marker
  if (helpFormMap && typeof google !== 'undefined') {
    if (helpFormMarker) {
      helpFormMarker.setMap(null)
    }

    helpFormMarker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: helpFormMap,
      draggable: true,
      title: 'Your Location'
    })

    helpFormMap.setCenter({ lat: latitude, lng: longitude })
    helpFormMap.setZoom(15)

    // Update marker position when dragged
    helpFormMarker.addListener('dragend', (e: any) => {
      const newLat = e.latLng.lat()
      const newLng = e.latLng.lng()
      
      // Validate location is within Sri Lanka
      if (!isWithinSriLanka(newLat, newLng)) {
        const tr = t()
        showLocationStatus(locationStatus, tr.helpForm.locationError || 'Location must be within Sri Lanka. Please drag the marker inside Sri Lanka.', 'error')
        // Reset marker to last valid position
        if (latitudeInput && longitudeInput) {
          const lastLat = parseFloat(latitudeInput.value) || 7.8731
          const lastLng = parseFloat(longitudeInput.value) || 80.7718
          helpFormMarker.setPosition({ lat: lastLat, lng: lastLng })
        }
        return
      }
      
      if (latitudeInput) latitudeInput.value = newLat.toString()
      if (longitudeInput) longitudeInput.value = newLng.toString()
      reverseGeocode(newLat, newLng, locationInput, locationStatus)
    })
  }

  // Get address from coordinates
  await reverseGeocode(latitude, longitude, locationInput, locationStatus)
}

// Reverse geocode coordinates to address
async function reverseGeocode(
  latitude: number,
  longitude: number,
  locationInput: HTMLInputElement | null,
  locationStatus: HTMLDivElement | null
): Promise<void> {
  if (typeof google === 'undefined') {
    if (locationInput) locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    showLocationStatus(locationStatus, `Location set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 'success')
    return
  }

  try {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        if (locationInput) locationInput.value = results[0].formatted_address
        showLocationStatus(locationStatus, `Location set: ${results[0].formatted_address}`, 'success')
      } else {
        if (locationInput) locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        showLocationStatus(locationStatus, `Location set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 'success')
      }
    })
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    if (locationInput) locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    showLocationStatus(locationStatus, `Location set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 'success')
  }
}

// Show location status
function showLocationStatus(
  statusElement: HTMLDivElement | null,
  message: string,
  type: 'loading' | 'success' | 'error'
): void {
  if (!statusElement) return
  
  statusElement.textContent = message
  statusElement.className = `location-status location-status-${type}`
  
  if (type === 'success') {
    setTimeout(() => {
      statusElement.textContent = ''
      statusElement.className = 'location-status'
    }, 5000)
  }
}

async function submitToDisasterCenter(request: HelpRequest): Promise<void> {
  // Convert timestamp to ISO string if it's a Date object
  const requestData = {
    ...request,
    timestamp: request.timestamp instanceof Date ? request.timestamp.toISOString() : request.timestamp
  }
  
  await submitHelpRequest(requestData)
}

