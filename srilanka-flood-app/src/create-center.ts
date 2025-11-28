import type { DisasterCenter } from './disaster-centers.ts'
import { t, getCurrentLanguage } from './i18n.ts'
import { createDisasterCenter } from './api.ts'
import { formatPhoneNumber, validatePhoneNumber } from './phone-formatter.ts'

// Declare Google Maps
declare const google: any

let createCenterMap: any = null
let createCenterMarker: any = null

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

export function createCenterFormHTML(): string {
  const tr = t()
  
  return `
    <div class="form-container">
      <div class="form-header">
        <h1>➕ ${tr.createCenterForm?.title || 'Create New Disaster Center'}</h1>
        <p class="subtitle">${tr.createCenterForm?.subtitle || 'Register a new disaster relief center to help those in need'}</p>
      </div>
      
      <form id="create-center-form" class="help-form">
        <div class="form-group">
          <label for="center-name">${tr.createCenterForm?.nameLabel || 'Center Name'} *</label>
          <input type="text" id="center-name" name="center-name" required placeholder="${tr.createCenterForm?.namePlaceholder || 'Enter disaster center name'}">
        </div>
        
        <div class="form-group">
          <label for="center-address">${tr.createCenterForm?.addressLabel || 'Full Address'} *</label>
          <textarea id="center-address" name="center-address" rows="2" required placeholder="${tr.createCenterForm?.addressPlaceholder || 'Enter complete address'}"></textarea>
        </div>
        
        <div class="form-group">
          <label for="center-phone">${tr.createCenterForm?.phoneLabel || 'Contact Phone'} *</label>
          <input type="tel" id="center-phone" name="center-phone" required placeholder="${tr.createCenterForm?.phonePlaceholder || '0XXXXXXXXX (e.g., 0765367297)'}">
          <div id="phone-error" class="field-error"></div>
        </div>
        
        <div class="form-group">
          <label for="center-capacity">${tr.createCenterForm?.capacityLabel || 'Maximum Capacity'} *</label>
          <input type="number" id="center-capacity" name="center-capacity" min="1" max="10000" required placeholder="${tr.createCenterForm?.capacityPlaceholder || 'Maximum number of people'}">
        </div>
        
        <div class="form-group">
          <label for="center-status">${tr.createCenterForm?.statusLabel || 'Status'} *</label>
          <select id="center-status" name="center-status" required>
            <option value="" disabled selected>${tr.createCenterForm?.selectStatus || 'Select status'}</option>
            <option value="active">${tr.status?.active || 'Active'}</option>
            <option value="limited">${tr.status?.limited || 'Limited'}</option>
            <option value="full">${tr.status?.full || 'Full'}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>${tr.createCenterForm?.servicesLabel || 'Services'} * (${tr.createCenterForm?.selectAll || 'Select all that apply'})</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" name="center-services" value="Shelter">
              <span>${tr.services?.Shelter || 'Shelter'}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="center-services" value="Food">
              <span>${tr.services?.Food || 'Food & Water'}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="center-services" value="Medical">
              <span>${tr.services?.Medical || 'Medical Assistance'}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="center-services" value="Clothing">
              <span>${tr.services?.Clothing || 'Clothing'}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" name="center-services" value="Transportation">
              <span>${tr.services?.Transportation || 'Transportation'}</span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label>${tr.createCenterForm?.locationOnMapLabel || 'Location'} *</label>
          <div id="create-center-map" class="map-container"></div>
          <p class="map-instruction">${tr.createCenterForm?.mapInstruction || 'Click on the map to select the center\'s location'}</p>
          <input type="hidden" id="center-latitude" name="center-latitude" required>
          <input type="hidden" id="center-longitude" name="center-longitude" required>
          <div id="map-coords-display" class="location-status"></div>
        </div>
        
        <div class="form-group">
          <label for="center-image" class="image-upload-label">
            <span>📷</span>
            <span>${tr.createCenterForm?.imageLabel || 'Center Image'} <span class="optional-badge">(Optional)</span></span>
          </label>
          <div class="image-upload-container">
            <input type="file" id="center-image" name="center-image" accept="image/*" class="image-input">
            <div class="image-preview-container" id="center-image-preview-container" style="display: none;">
              <img id="center-image-preview" class="image-preview" alt="Center Image Preview">
              <button type="button" class="remove-image-btn" id="remove-center-image-btn">✕</button>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="center-additional-info">${tr.createCenterForm?.additionalInfoLabel || 'Additional Information'}</label>
          <textarea id="center-additional-info" name="center-additional-info" rows="3" placeholder="${tr.createCenterForm?.additionalInfoPlaceholder || 'Any additional information about the center (Optional)'}"></textarea>
        </div>
        
        <button type="submit" class="submit-btn">${tr.createCenterForm?.submitButton || '➕ Add Disaster Center'}</button>
      </form>
      
      <div id="loading-overlay" class="loading-overlay hidden">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text" id="loading-text">සුරකිමින්...</p>
        </div>
      </div>
      
      <div id="success-message" class="message success-message hidden">
        <h2>✅ ${tr.createCenterForm?.successTitle || 'Disaster Center Added Successfully!'}</h2>
        <p>${tr.createCenterForm?.successMessage || 'Your disaster center has been registered and will appear on the map.'}</p>
      </div>
      
      <div id="error-message" class="message error-message hidden">
        <h2>❌ ${tr.createCenterForm?.errorTitle || 'Error Adding Center'}</h2>
        <p>${tr.createCenterForm?.errorMessage || 'There was an error adding the disaster center. Please try again.'}</p>
      </div>
    </div>
  `
}

export function setupCreateCenterForm(container: HTMLElement, showDashboardCallback: () => void): void {
  const tr = t()
  const form = container.querySelector<HTMLFormElement>('#create-center-form')
  const phoneInput = container.querySelector<HTMLInputElement>('#center-phone')
  const phoneError = container.querySelector<HTMLDivElement>('#phone-error')
  const mapContainer = container.querySelector<HTMLDivElement>('#create-center-map')
  const latitudeInput = container.querySelector<HTMLInputElement>('#center-latitude')
  const longitudeInput = container.querySelector<HTMLInputElement>('#center-longitude')
  const mapCoordsDisplay = container.querySelector<HTMLDivElement>('#map-coords-display')
  const successMessage = container.querySelector<HTMLDivElement>('#success-message')
  const errorMessage = container.querySelector<HTMLDivElement>('#error-message')
  const centerImageInput = container.querySelector<HTMLInputElement>('#center-image')
  const centerImagePreview = container.querySelector<HTMLImageElement>('#center-image-preview')
  const centerImagePreviewContainer = container.querySelector<HTMLDivElement>('#center-image-preview-container')
  const removeCenterImageBtn = container.querySelector<HTMLButtonElement>('#remove-center-image-btn')
  let centerImageBase64: string | undefined = undefined

  if (!form) return

  // Initialize map with error handling
  if (mapContainer) {
    if (typeof google !== 'undefined' && google.maps) {
      initializeCreateCenterMap(mapContainer, latitudeInput, longitudeInput, mapCoordsDisplay)
    } else if ((window as any).googleMapsError) {
      mapContainer.innerHTML = `<p class="location-status error">Google Maps failed to load. Please check your API key.</p>`
    } else {
      // Wait for Google Maps to load
      let attempts = 0
      const maxAttempts = 50
      
      const checkGoogleMaps = setInterval(() => {
        attempts++
        
        if ((window as any).googleMapsError) {
          clearInterval(checkGoogleMaps)
          mapContainer.innerHTML = `<p class="location-status error">Google Maps failed to load. Please check your API key.</p>`
        } else if (typeof google !== 'undefined' && google.maps) {
          clearInterval(checkGoogleMaps)
          initializeCreateCenterMap(mapContainer, latitudeInput, longitudeInput, mapCoordsDisplay)
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogleMaps)
          mapContainer.innerHTML = `<p class="location-status error">Google Maps failed to load. Please check your API key.</p>`
        }
      }, 100)
      
      window.addEventListener('googlemapsloaded', () => {
        clearInterval(checkGoogleMaps)
        if (mapContainer && typeof google !== 'undefined' && google.maps) {
          initializeCreateCenterMap(mapContainer, latitudeInput, longitudeInput, mapCoordsDisplay)
        }
      }, { once: true })
      
      window.addEventListener('googlemapserror', () => {
        clearInterval(checkGoogleMaps)
        mapContainer.innerHTML = `<p class="location-status error">Google Maps failed to load. Please check your API key.</p>`
      }, { once: true })
    }
  }

  // Phone number formatting and validation
  if (phoneInput && phoneError) {
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
      
      // Validate
      const phone = input.value.trim()
      if (phone && !validatePhoneNumber(phone)) {
        phoneError.textContent = tr.createCenterForm?.phoneInvalid || 'Please enter a valid Sri Lankan phone number.'
        phoneError.style.display = 'block'
        phoneInput.classList.add('invalid')
      } else {
        phoneError.style.display = 'none'
        phoneInput.classList.remove('invalid')
      }
    })
    
    phoneInput.addEventListener('blur', () => {
      const phone = phoneInput.value.trim()
      if (phone && !validatePhoneNumber(phone)) {
        phoneError.textContent = tr.createCenterForm?.phoneInvalid || 'Please enter a valid Sri Lankan phone number.'
        phoneError.style.display = 'block'
        phoneInput.classList.add('invalid')
      } else {
        phoneError.style.display = 'none'
        phoneInput.classList.remove('invalid')
      }
    })
  }

  // Center image upload handling
  if (centerImageInput && centerImagePreview && centerImagePreviewContainer && removeCenterImageBtn) {
    centerImageInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          centerImageInput.value = ''
          return
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB')
          centerImageInput.value = ''
          return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          centerImageBase64 = result
          if (centerImagePreview) {
            centerImagePreview.src = result
            centerImagePreviewContainer.style.display = 'block'
          }
        }
        reader.readAsDataURL(file)
      }
    })

    removeCenterImageBtn.addEventListener('click', () => {
      centerImageBase64 = undefined
      if (centerImageInput) centerImageInput.value = ''
      if (centerImagePreview) centerImagePreview.src = ''
      if (centerImagePreviewContainer) centerImagePreviewContainer.style.display = 'none'
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

    // Validate phone
    if (phoneInput && phoneError) {
      const phone = phoneInput.value.trim()
      if (!validatePhoneNumber(phone)) {
        phoneError.textContent = tr.createCenterForm?.phoneInvalid || 'Please enter a valid Sri Lankan phone number.'
        phoneInput.classList.add('invalid')
        return
      }
    }

    const formData = new FormData(form)
    const services = form.querySelectorAll<HTMLInputElement>('input[name="center-services"]:checked')

    if (services.length === 0) {
      alert(tr.createCenterForm?.selectServicesAlert || 'Please select at least one service.')
      return
    }

    if (!latitudeInput?.value || !longitudeInput?.value) {
      alert(tr.createCenterForm?.locationRequired || 'Please select a location on the map.')
      return
    }

    // Validate location is within Sri Lanka
    const lat = parseFloat(latitudeInput.value)
    const lng = parseFloat(longitudeInput.value)
    if (!isWithinSriLanka(lat, lng)) {
      alert(tr.createCenterForm?.locationError || 'Location must be within Sri Lanka. Please select a location inside Sri Lanka.')
      return
    }

    const newCenter: DisasterCenter = {
      id: 'dc' + Date.now(),
      name: formData.get('center-name') as string,
      address: formData.get('center-address') as string,
      phone: formData.get('center-phone') as string,
      latitude: parseFloat(latitudeInput.value),
      longitude: parseFloat(longitudeInput.value),
      capacity: parseInt(formData.get('center-capacity') as string),
      services: Array.from(services).map(cb => cb.value),
      status: formData.get('center-status') as 'active' | 'full' | 'limited',
      image: centerImageBase64,
      additionalInfo: (formData.get('center-additional-info') as string) || undefined
    }

    try {
      await saveDisasterCenter(newCenter)
      
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
        if (centerImageInput) centerImageInput.value = ''
        if (centerImagePreview) centerImagePreview.src = ''
        if (centerImagePreviewContainer) centerImagePreviewContainer.style.display = 'none'
        centerImageBase64 = undefined
        if (createCenterMarker) {
          createCenterMarker.setMap(null)
          createCenterMarker = null
        }
        if (createCenterMap) {
          createCenterMap.setCenter({ lat: 7.8731, lng: 80.7718 })
          createCenterMap.setZoom(8)
        }
        if (latitudeInput) latitudeInput.value = ''
        if (longitudeInput) longitudeInput.value = ''
        if (mapCoordsDisplay) mapCoordsDisplay.textContent = ''
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        setTimeout(showDashboardCallback, 2000)
      }
    } catch (error) {
      console.error('Error creating disaster center:', error)
      
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

async function saveDisasterCenter(center: DisasterCenter): Promise<void> {
  await createDisasterCenter(center)
}

function initializeCreateCenterMap(
  mapContainer: HTMLDivElement,
  latitudeInput: HTMLInputElement | null,
  longitudeInput: HTMLInputElement | null,
  mapCoordsDisplay: HTMLDivElement | null
): void {
  if (mapContainer.hasChildNodes()) {
    mapContainer.innerHTML = ''
  }

  // Set Sri Lanka bounds
  const sriLankaBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(SRI_LANKA_BOUNDS.south, SRI_LANKA_BOUNDS.west),
    new google.maps.LatLng(SRI_LANKA_BOUNDS.north, SRI_LANKA_BOUNDS.east)
  )

  createCenterMap = new google.maps.Map(mapContainer, {
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
  createCenterMap.setOptions({
    restriction: {
      latLngBounds: sriLankaBounds,
      strictBounds: false
    }
  })

  createCenterMap.addListener('click', (e: any) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    
    // Validate location is within Sri Lanka
    if (!isWithinSriLanka(lat, lng)) {
      const tr = t()
      if (mapCoordsDisplay) {
        mapCoordsDisplay.textContent = tr.createCenterForm?.locationError || 'Location must be within Sri Lanka. Please select a location inside Sri Lanka.'
        mapCoordsDisplay.className = 'location-status error'
      }
      return
    }
    
    updateCreateCenterMapLocation(lat, lng, latitudeInput, longitudeInput, mapCoordsDisplay)
  })
}

function updateCreateCenterMapLocation(
  latitude: number,
  longitude: number,
  latitudeInput: HTMLInputElement | null,
  longitudeInput: HTMLInputElement | null,
  mapCoordsDisplay: HTMLDivElement | null
): void {
  const newLatLng = { lat: latitude, lng: longitude }
  createCenterMap.setCenter(newLatLng)
  createCenterMap.setZoom(15)

  if (createCenterMarker) {
    createCenterMarker.setPosition(newLatLng)
  } else {
    createCenterMarker = new google.maps.Marker({
      position: newLatLng,
      map: createCenterMap,
      draggable: true,
      title: 'Drag to adjust location'
    })

    createCenterMarker.addListener('dragend', (e: any) => {
      const dragLat = e.latLng.lat()
      const dragLng = e.latLng.lng()
      
      // Validate location is within Sri Lanka
      if (!isWithinSriLanka(dragLat, dragLng)) {
        const tr = t()
        if (mapCoordsDisplay) {
          mapCoordsDisplay.textContent = tr.createCenterForm?.locationError || 'Location must be within Sri Lanka. Please drag the marker inside Sri Lanka.'
          mapCoordsDisplay.className = 'location-status error'
        }
        // Reset marker to last valid position
        if (latitudeInput && longitudeInput && latitudeInput.value && longitudeInput.value) {
          const lastLat = parseFloat(latitudeInput.value)
          const lastLng = parseFloat(longitudeInput.value)
          createCenterMarker.setPosition({ lat: lastLat, lng: lastLng })
        } else {
          // Reset to center of Sri Lanka
          createCenterMarker.setPosition({ lat: 7.8731, lng: 80.7718 })
        }
        return
      }
      
      updateCreateCenterMapLocation(dragLat, dragLng, latitudeInput, longitudeInput, mapCoordsDisplay)
    })
  }

  if (latitudeInput) latitudeInput.value = latitude.toString()
  if (longitudeInput) longitudeInput.value = longitude.toString()
  if (mapCoordsDisplay) {
    mapCoordsDisplay.textContent = `Selected Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    mapCoordsDisplay.className = 'location-status success'
  }
}

