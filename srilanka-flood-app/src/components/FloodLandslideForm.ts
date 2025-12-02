import { submitFloodLandslideReport, type FloodLandslideReport } from '../services/api.ts'
import { t, getCurrentLanguage } from '../utils/i18n.ts'
import { formatPhoneNumber, validatePhoneNumber } from '../utils/phone-formatter.ts'

// Declare Google Maps
declare const google: any

let floodLandslideFormMap: any = null
let floodLandslideFormMarker: any = null

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

// Create Flood/Landslide Report Form HTML
export function createFloodLandslideFormHTML(): string {
  const tr = t()
  const currentLang = getCurrentLanguage()
  
  return `
    <div class="form-container">
      <div class="form-header">
        <h1 data-i18n="floodLandslide.title">${tr.floodLandslide.title}</h1>
      </div>
      
      <form id="flood-landslide-form" class="help-form">
          <!-- Type Selection -->
          <div class="form-group">
            <label for="type" data-i18n="floodLandslide.type">${tr.floodLandslide.type} *</label>
            <select id="type" name="type" required>
              <option value="">${currentLang === 'si' ? 'තෝරන්න' : 'Select Type'}</option>
              <option value="flood">${tr.floodLandslide.flood}</option>
              <option value="landslide">${tr.floodLandslide.landslide}</option>
            </select>
          </div>

          <!-- Severity -->
          <div class="form-group">
            <label for="severity" data-i18n="floodLandslide.severity">${tr.floodLandslide.severity} *</label>
            <select id="severity" name="severity" required>
              <option value="">${currentLang === 'si' ? 'තෝරන්න' : 'Select Severity'}</option>
              <option value="low">${tr.floodLandslide.low}</option>
              <option value="medium">${tr.floodLandslide.medium}</option>
              <option value="high">${tr.floodLandslide.high}</option>
              <option value="critical">${tr.floodLandslide.critical}</option>
            </select>
          </div>

          <!-- Location -->
          <div class="form-group">
            <label for="location" data-i18n="floodLandslide.location">${tr.floodLandslide.location} *</label>
            <div class="location-input-group">
              <input type="text" id="location" name="location" required placeholder="${tr.floodLandslide.location}">
              <button type="button" id="get-location-btn" class="get-location-btn">
                <span>📍</span>
                <span data-i18n="floodLandslide.getLocation">${tr.floodLandslide.getLocation}</span>
              </button>
            </div>
            <div id="location-status" class="location-status"></div>
            <div id="flood-landslide-form-map" class="map-container"></div>
            <p class="map-instruction" data-i18n="helpForm.locationDetecting">${tr.helpForm.locationDetecting || 'Click on the map to select location'}</p>
            <input type="hidden" id="latitude" name="latitude">
            <input type="hidden" id="longitude" name="longitude">
          </div>

          <!-- Reported By -->
          <div class="form-group">
            <label for="reportedBy" data-i18n="floodLandslide.reportedBy">${tr.floodLandslide.reportedBy} *</label>
            <input type="text" id="reportedBy" name="reportedBy" required placeholder="${currentLang === 'si' ? 'ඔබේ නම ඇතුළත් කරන්න...' : 'Enter your name...'}" autocomplete="name">
          </div>

          <!-- Phone (Optional) -->
          <div class="form-group">
            <label for="phone" data-i18n="floodLandslide.phone">${tr.floodLandslide.phone}</label>
            <input type="tel" id="phone" name="phone" placeholder="${currentLang === 'si' ? 'දුරකථන අංකය (උදා: 0765367297)' : 'Phone number (e.g., 0765367297)'}" autocomplete="tel">
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? '(විකල්ප) - සම්බන්ධ වීමට අවශ්‍ය නම් දුරකථන අංකය ඇතුළත් කරන්න' : '(Optional) - Enter phone number if you want responders to contact you'}</small>
          </div>

          <!-- Number of People Affected -->
          <div class="form-group">
            <label for="peopleAffected" data-i18n="floodLandslide.peopleAffected">${tr.floodLandslide.peopleAffected || 'Number of People Affected'}</label>
            <input type="number" id="peopleAffected" name="peopleAffected" min="0" placeholder="${currentLang === 'si' ? 'පීඩිත පුද්ගලයින් ගණන...' : 'Number of people affected...'}">
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? '(විකල්ප) - ගංවතුර/පාෂාණ පහරෙන් පීඩාවට පත් පුද්ගලයින් ගණන' : '(Optional) - Number of people affected by flood/landslide'}</small>
          </div>

          <!-- Road Access Status -->
          <div class="form-group">
            <label for="roadAccess" data-i18n="floodLandslide.roadAccess">${tr.floodLandslide.roadAccess || 'Road Access Status'}</label>
            <select id="roadAccess" name="roadAccess">
              <option value="">${currentLang === 'si' ? 'තෝරන්න' : 'Select Status'}</option>
              <option value="accessible">${tr.floodLandslide.accessible || 'Accessible'}</option>
              <option value="partially-blocked">${tr.floodLandslide.partiallyBlocked || 'Partially Blocked'}</option>
              <option value="completely-blocked">${tr.floodLandslide.completelyBlocked || 'Completely Blocked'}</option>
            </select>
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? '(විකල්ප) - මාර්ගයට ප්‍රවේශ විය හැකි තත්වය' : '(Optional) - Current road access status'}</small>
          </div>

          <!-- Evacuation Status (for floods) -->
          <div class="form-group" id="evacuation-status-group" style="display: none;">
            <label for="evacuationStatus" data-i18n="floodLandslide.evacuationStatus">${tr.floodLandslide.evacuationStatus || 'Evacuation Status'}</label>
            <select id="evacuationStatus" name="evacuationStatus">
              <option value="">${currentLang === 'si' ? 'තෝරන්න' : 'Select Status'}</option>
              <option value="not-needed">${tr.floodLandslide.evacuationNotNeeded || 'Evacuation Not Needed'}</option>
              <option value="in-progress">${tr.floodLandslide.evacuationInProgress || 'Evacuation In Progress'}</option>
              <option value="completed">${tr.floodLandslide.evacuationCompleted || 'Evacuation Completed'}</option>
              <option value="urgent-needed">${tr.floodLandslide.evacuationUrgentNeeded || 'Urgent Evacuation Needed'}</option>
            </select>
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? '(විකල්ප) - ගංවතුර සඳහා පමණක්' : '(Optional) - For floods only'}</small>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" data-i18n="floodLandslide.description">${tr.floodLandslide.description} *</label>
            <textarea id="description" name="description" rows="5" required placeholder="${currentLang === 'si' ? 'විස්තරාත්මක විස්තරයක් ඇතුළත් කරන්න:\n- ගංවතුර/පාෂාණ පහරේ වර්තමාන තත්වය\n- අවදානම් සහිත ප්‍රදේශ\n- අවශ්‍ය උදව් හෝ සහාය\n- වෙනත් වැදගත් තොරතුරු...' : 'Enter detailed description:\n- Current situation of flood/landslide\n- Areas at risk\n- Required assistance or help\n- Any other important information...'}"></textarea>
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? 'කරුණාකර විස්තරාත්මක විස්තරයක් සපයන්න, එවිට අනෙක් අයට ඔබට සම්බන්ධ වීමට හෝ උදව් කිරීමට හැකි වනු ඇත' : 'Please provide detailed information so others can contact you or provide assistance'}</small>
          </div>

          <!-- Image Upload -->
          <div class="form-group">
            <label for="verification-image" class="image-upload-label">
              <span>📷</span>
              <span data-i18n="floodLandslide.image">${tr.floodLandslide.image}</span>
              <span class="optional-badge">(Optional)</span>
            </label>
            <div class="image-upload-container">
              <input type="file" id="verification-image" name="verification-image" accept="image/*" class="image-input" capture="environment">
              <div class="image-preview-container" id="image-preview-container" style="display: none;">
                <img id="image-preview" class="image-preview" alt="Image Preview">
                <button type="button" class="remove-image-btn" id="remove-image-btn">✕</button>
              </div>
            </div>
          </div>

          <button type="submit" class="submit-btn" data-i18n="floodLandslide.submit">${tr.floodLandslide.submit}</button>
        </form>
        
        <div id="loading-overlay" class="loading-overlay hidden">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p class="loading-text" id="loading-text">${getCurrentLanguage() === 'si' ? 'සුරකිමින්...' : 'Saving...'}</p>
          </div>
        </div>

        <!-- Success Message -->
        <div id="success-message" class="message success-message hidden">
          <h2 data-i18n="floodLandslide.success">✅ ${tr.floodLandslide.success}</h2>
          <p data-i18n="floodLandslide.successMessage">${tr.floodLandslide.successMessage}</p>
        </div>

        <!-- Error Message -->
        <div id="error-message" class="message error-message hidden">
          <h2 data-i18n="floodLandslide.error">❌ ${tr.floodLandslide.error}</h2>
          <p data-i18n="floodLandslide.errorMessage">${tr.floodLandslide.errorMessage}</p>
        </div>
    </div>
  `
}

// Setup Flood/Landslide Form
export function setupFloodLandslideForm(container: HTMLElement): void {
  const form = container.querySelector<HTMLFormElement>('#flood-landslide-form')
  const getLocationBtn = container.querySelector<HTMLButtonElement>('#get-location-btn')
  const locationInput = container.querySelector<HTMLInputElement>('#location')
  const latitudeInput = container.querySelector<HTMLInputElement>('#latitude')
  const longitudeInput = container.querySelector<HTMLInputElement>('#longitude')
  const locationStatus = container.querySelector<HTMLElement>('#location-status')
  const successMessage = container.querySelector<HTMLElement>('#success-message')
  const errorMessage = container.querySelector<HTMLElement>('#error-message')
  const tr = t()

  if (!form || !getLocationBtn || !locationInput || !latitudeInput || !longitudeInput) return

  // Show/hide evacuation status based on type selection
  const typeSelect = container.querySelector<HTMLSelectElement>('#type')
  const evacuationStatusGroup = container.querySelector<HTMLDivElement>('#evacuation-status-group')
  
  if (typeSelect && evacuationStatusGroup) {
    typeSelect.addEventListener('change', () => {
      if (typeSelect.value === 'flood') {
        evacuationStatusGroup.style.display = 'block'
      } else {
        evacuationStatusGroup.style.display = 'none'
        const evacuationSelect = container.querySelector<HTMLSelectElement>('#evacuationStatus')
        if (evacuationSelect) evacuationSelect.value = ''
      }
    })
  }

  // Get location button handler
  getLocationBtn.addEventListener('click', async () => {
    if (!navigator.geolocation) {
      if (locationStatus) {
        locationStatus.className = 'location-status location-status-error'
        locationStatus.textContent = 'Geolocation is not supported by your browser. Please click on the map to set your location.'
        locationStatus.style.display = 'block'
      } else {
        alert('Geolocation is not supported by your browser. Please click on the map to set your location.')
      }
      return
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isAndroid = /Android/i.test(navigator.userAgent)

    if (getLocationBtn) {
      getLocationBtn.disabled = true
      getLocationBtn.innerHTML = '<span>⏳</span> <span>' + (tr.floodLandslide.getLocation || 'Getting Location...') + '</span>'
    }

    if (locationStatus) {
      locationStatus.className = 'location-status location-status-loading'
      locationStatus.textContent = tr.floodLandslide.locationDetecting || 'Getting your location...'
      locationStatus.style.display = 'block'
    }

    try {
      const geoOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: isMobile ? 20000 : 15000,
        maximumAge: isMobile ? 60000 : 0
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          geoOptions
        )
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude

      if (!isWithinSriLanka(lat, lng)) {
        if (locationStatus) {
          locationStatus.className = 'location-status location-status-error'
          locationStatus.textContent = tr.floodLandslide.locationError || 'Your location is outside Sri Lanka. Please click on the map to select a location within Sri Lanka.'
          locationStatus.style.display = 'block'
        } else {
          alert(tr.floodLandslide.locationError || 'Location must be within Sri Lanka. Please click on the map to select a location inside Sri Lanka.')
        }
        if (getLocationBtn) {
          getLocationBtn.disabled = false
          getLocationBtn.innerHTML = '<span>📍</span> <span>' + (tr.floodLandslide.getLocation || 'Get My Location') + '</span>'
        }
        return
      }

      await updateLocationFromCoordinates(lat, lng, locationInput, locationStatus, latitudeInput, longitudeInput)
      
      if (getLocationBtn) {
        getLocationBtn.disabled = false
        getLocationBtn.innerHTML = '<span>📍</span> <span>' + (tr.floodLandslide.getLocation || 'Get My Location') + '</span>'
      }
    } catch (error: any) {
      console.error('Error getting location:', error)
      let errorMessage = tr.floodLandslide.locationError || 'Unable to get your location. Please click on the map to set your location.'
      
      if (error && typeof error.code === 'number') {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            if (isIOS) {
              errorMessage = 'Location access denied. Please go to Settings > Safari > Location Services and allow location access for this website, or click on the map to set your location manually.'
            } else if (isAndroid) {
              errorMessage = 'Location access denied. Please allow location access in Chrome settings (Settings > Site Settings > Location), or click on the map to set your location manually.'
            } else {
              errorMessage = 'Location access denied. Please allow location access in your browser settings, or click on the map to set your location manually.'
            }
            break
          case 2: // POSITION_UNAVAILABLE
            if (isMobile) {
              errorMessage = 'Location information unavailable. Please make sure GPS/Location Services are enabled on your device, or click on the map to set your location manually.'
            } else {
              errorMessage = 'Location information unavailable. Please click on the map to set your location.'
            }
            break
          case 3: // TIMEOUT
            if (isMobile) {
              errorMessage = 'Location request timed out. Please make sure GPS/Location Services are enabled and try again, or click on the map to set your location manually.'
            } else {
              errorMessage = 'Location request timed out. Please click on the map to set your location.'
            }
            break
        }
      }
      
      if (locationStatus) {
        locationStatus.className = 'location-status location-status-error'
        locationStatus.textContent = errorMessage
        locationStatus.style.display = 'block'
      } else {
        alert(errorMessage)
      }
      
      if (getLocationBtn) {
        getLocationBtn.disabled = false
        getLocationBtn.innerHTML = '<span>📍</span> <span>' + (tr.floodLandslide.getLocation || 'Get My Location') + '</span>'
      }
    }
  })

  // Phone number formatting
  const phoneInput = container.querySelector<HTMLInputElement>('#phone')
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement
      const cursorPosition = input.selectionStart || 0
      const oldValue = input.value
      const newValue = formatPhoneNumber(input.value)
      
      if (oldValue !== newValue) {
        input.value = newValue
        const cursorOffset = newValue.length - oldValue.length
        const newPosition = Math.max(0, Math.min(newValue.length, cursorPosition + cursorOffset))
        input.setSelectionRange(newPosition, newPosition)
      }
    })
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
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          imageInput.value = ''
          return
        }
        
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

  // Initialize map with error handling
  const mapContainer = container.querySelector<HTMLDivElement>('#flood-landslide-form-map')
  if (mapContainer) {
    if (typeof google !== 'undefined' && google.maps) {
      initializeFloodLandslideFormMap(mapContainer, locationInput, locationStatus, latitudeInput, longitudeInput, getLocationBtn)
    } else if ((window as any).googleMapsError) {
      showFloodLandslideFormMapError(mapContainer)
    } else {
      let attempts = 0
      const maxAttempts = 50
      
      const checkGoogleMaps = setInterval(() => {
        attempts++
        
        if ((window as any).googleMapsError) {
          clearInterval(checkGoogleMaps)
          showFloodLandslideFormMapError(mapContainer)
        } else if (typeof google !== 'undefined' && google.maps) {
          clearInterval(checkGoogleMaps)
          initializeFloodLandslideFormMap(mapContainer, locationInput, locationStatus, latitudeInput, longitudeInput, getLocationBtn)
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogleMaps)
          showFloodLandslideFormMapError(mapContainer)
        }
      }, 100)
      
      window.addEventListener('googlemapsloaded', () => {
        clearInterval(checkGoogleMaps)
        if (mapContainer && typeof google !== 'undefined' && google.maps) {
          initializeFloodLandslideFormMap(mapContainer, locationInput, locationStatus, latitudeInput, longitudeInput, getLocationBtn)
        }
      }, { once: true })
      
      window.addEventListener('googlemapserror', () => {
        clearInterval(checkGoogleMaps)
        showFloodLandslideFormMapError(mapContainer)
      }, { once: true })
    }
  }

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const loadingOverlay = container.querySelector<HTMLDivElement>('#loading-overlay')
    const loadingText = container.querySelector<HTMLParagraphElement>('#loading-text')
    const submitBtn = form.querySelector<HTMLButtonElement>('.submit-btn')

    if (successMessage) successMessage.classList.add('hidden')
    if (errorMessage) errorMessage.classList.add('hidden')

    const formData = new FormData(form)
    const type = formData.get('type') as string
    const severity = formData.get('severity') as string
    const location = formData.get('location') as string
    const latitude = formData.get('latitude') as string
    const longitude = formData.get('longitude') as string
    const description = formData.get('description') as string
    const reportedBy = formData.get('reportedBy') as string
    const phone = (formData.get('phone') as string)?.trim() || undefined
    const peopleAffected = formData.get('peopleAffected') as string
    const roadAccess = formData.get('roadAccess') as string
    const evacuationStatus = formData.get('evacuationStatus') as string

    // Validation (phone is optional)
    if (!type || !severity || !location || !latitude || !longitude || !description || !reportedBy) {
      alert(tr.floodLandslide.locationRequired || 'Please fill in all required fields')
      return
    }

    // Validate phone number only if provided (optional field)
    if (phone && !validatePhoneNumber(phone)) {
      alert(tr.floodLandslide.phone + ' - ' + 'Please enter a valid Sri Lankan phone number.')
      if (phoneInput) phoneInput.focus()
      return
    }

    // Validate location is within Sri Lanka
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (!isWithinSriLanka(lat, lng)) {
      alert(tr.floodLandslide.locationError || 'Location must be within Sri Lanka. Please select a location inside Sri Lanka.')
      return
    }

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

    try {
      // Build enhanced description with additional details
      let enhancedDescription = description
      const additionalDetails: string[] = []
      
      if (peopleAffected) {
        additionalDetails.push(`${getCurrentLanguage() === 'si' ? 'පීඩිත පුද්ගලයින්' : 'People Affected'}: ${peopleAffected}`)
      }
      if (roadAccess) {
        additionalDetails.push(`${getCurrentLanguage() === 'si' ? 'මාර්ග ප්‍රවේශය' : 'Road Access'}: ${roadAccess}`)
      }
      if (evacuationStatus && type === 'flood') {
        additionalDetails.push(`${getCurrentLanguage() === 'si' ? 'ඉවත් කිරීමේ තත්වය' : 'Evacuation Status'}: ${evacuationStatus}`)
      }
      
      if (additionalDetails.length > 0) {
        enhancedDescription = `${description}\n\n--- Additional Details ---\n${additionalDetails.join('\n')}`
      }

      // Prepare report data
      const reportData: Omit<FloodLandslideReport, 'id' | 'timestamp'> = {
        type: type as 'flood' | 'landslide',
        location,
        latitude: lat,
        longitude: lng,
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        description: enhancedDescription,
        reportedBy: reportedBy,
        phone: phone,
        image: verificationImageBase64,
      }

      // Submit report
      await submitFloodLandslideReport(reportData)

      // Hide loading screen
      if (loadingOverlay) loadingOverlay.classList.add('hidden')
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.style.opacity = '1'
        submitBtn.style.cursor = 'pointer'
      }

      // Show success message
      if (successMessage) {
        successMessage.classList.remove('hidden')
        form.reset()
        verificationImageBase64 = undefined
        if (imagePreviewContainer) imagePreviewContainer.style.display = 'none'
        if (locationInput) locationInput.value = ''
        if (latitudeInput) latitudeInput.value = ''
        if (longitudeInput) longitudeInput.value = ''
        if (floodLandslideFormMarker) {
          floodLandslideFormMarker.setMap(null)
          floodLandslideFormMarker = null
        }
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    } catch (error: any) {
      console.error('Error submitting flood/landslide report:', error)
      
      // Hide loading screen
      if (loadingOverlay) loadingOverlay.classList.add('hidden')
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.style.opacity = '1'
        submitBtn.style.cursor = 'pointer'
      }

      if (errorMessage) {
        errorMessage.classList.remove('hidden')
        const errorText = errorMessage.querySelector('p')
        if (errorText) {
          errorText.textContent = error.message || tr.floodLandslide.errorMessage
        }
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  })
}

// Initialize map for flood/landslide form
function initializeFloodLandslideFormMap(
  mapContainer: HTMLDivElement,
  locationInput: HTMLInputElement | null,
  locationStatus: HTMLElement | null,
  latitudeInput: HTMLInputElement | null,
  longitudeInput: HTMLInputElement | null,
  _getLocationBtn: HTMLButtonElement | null
): void {
  try {
    if (mapContainer.hasChildNodes()) {
      mapContainer.innerHTML = ''
    }

    if (typeof google === 'undefined' || !google.maps) {
      showFloodLandslideFormMapError(mapContainer)
      return
    }

    // Set Sri Lanka bounds
    const sriLankaBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(SRI_LANKA_BOUNDS.south, SRI_LANKA_BOUNDS.west),
      new google.maps.LatLng(SRI_LANKA_BOUNDS.north, SRI_LANKA_BOUNDS.east)
    )

    floodLandslideFormMap = new google.maps.Map(mapContainer, {
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
    floodLandslideFormMap.setOptions({
      restriction: {
        latLngBounds: sriLankaBounds,
        strictBounds: false
      }
    })

    // Add click listener to map
    floodLandslideFormMap.addListener('click', (e: any) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      
      // Validate location is within Sri Lanka
      if (!isWithinSriLanka(lat, lng)) {
        const tr = t()
        if (locationStatus) {
          locationStatus.className = 'location-status location-status-error'
          locationStatus.textContent = tr.floodLandslide.locationError || 'Location must be within Sri Lanka. Please select a location inside Sri Lanka.'
          locationStatus.style.display = 'block'
        }
        return
      }
      
      updateLocationFromCoordinates(lat, lng, locationInput, locationStatus, latitudeInput, longitudeInput)
    })
    
    // Request location immediately after map is ready
    if (navigator.geolocation && locationInput && locationStatus && latitudeInput && longitudeInput) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude
              const lng = position.coords.longitude
              
              if (isWithinSriLanka(lat, lng)) {
                updateLocationFromCoordinates(lat, lng, locationInput, locationStatus, latitudeInput, longitudeInput)
              }
            },
            () => {
              // Silently fail if geolocation is denied - user can click button or map
            }
          )
        })
      })
    }
  } catch (error) {
    console.error('Error initializing flood/landslide form map:', error)
    showFloodLandslideFormMapError(mapContainer)
  }
}

// Show map error for flood/landslide form
function showFloodLandslideFormMapError(mapContainer: HTMLDivElement): void {
  mapContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 1.5rem; text-align: center; background: #f8f9fa; border-radius: 8px; border: 2px dashed #dee2e6;">
      <div style="font-size: 2rem; margin-bottom: 0.75rem;">📍</div>
      <p style="color: #6c757d; margin: 0; font-size: 0.9rem;">Map unavailable. You can still enter your location manually.</p>
    </div>
  `
}

// Update location from coordinates
async function updateLocationFromCoordinates(
  lat: number,
  lng: number,
  locationInput: HTMLInputElement | null,
  locationStatus: HTMLElement | null,
  latitudeInput: HTMLInputElement | null,
  longitudeInput: HTMLInputElement | null
): Promise<void> {
  if (latitudeInput) latitudeInput.value = lat.toString()
  if (longitudeInput) longitudeInput.value = lng.toString()

  // Update marker on map
  if (floodLandslideFormMap) {
    if (floodLandslideFormMarker) {
      floodLandslideFormMarker.setPosition({ lat, lng })
    } else {
      floodLandslideFormMarker = new google.maps.Marker({
        position: { lat, lng },
        map: floodLandslideFormMap,
        draggable: true
      })
      
      // Update position when marker is dragged
      floodLandslideFormMarker.addListener('dragend', (e: any) => {
        const newLat = e.latLng.lat()
        const newLng = e.latLng.lng()
        if (isWithinSriLanka(newLat, newLng)) {
          updateLocationFromCoordinates(newLat, newLng, locationInput, locationStatus, latitudeInput, longitudeInput)
        }
      })
    }
    
    floodLandslideFormMap.setCenter({ lat, lng })
    floodLandslideFormMap.setZoom(15)
  }

  // Reverse geocode to get address
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    const data = await response.json()
    const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    if (locationInput) locationInput.value = address
    
    if (locationStatus) {
      locationStatus.className = 'location-status location-status-success'
      locationStatus.textContent = 'Location set successfully'
      locationStatus.style.display = 'block'
      setTimeout(() => {
        if (locationStatus) locationStatus.style.display = 'none'
      }, 2000)
    }
  } catch (error) {
    if (locationInput) locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    if (locationStatus) {
      locationStatus.className = 'location-status location-status-success'
      locationStatus.textContent = 'Location coordinates set'
      locationStatus.style.display = 'block'
    }
  }
}

