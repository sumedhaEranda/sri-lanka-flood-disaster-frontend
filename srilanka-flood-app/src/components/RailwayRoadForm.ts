import { submitRailwayRoadReport, type RailwayRoadReport } from '../services/api.ts'
import { t, getCurrentLanguage } from '../utils/i18n.ts'
import { formatPhoneNumber, validatePhoneNumber } from '../utils/phone-formatter.ts'

// Declare Google Maps
declare const google: any

let railwayRoadFormMap: any = null
let railwayRoadFormMarker: any = null

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

// Create Railway/Road System Report Form HTML
export function createRailwayRoadFormHTML(): string {
  const tr = t()
  const currentLang = getCurrentLanguage()
  
  return `
    <div class="form-container">
      <div class="form-header">
        <h1 data-i18n="railwayRoad.title">${tr.railwayRoad.title}</h1>
      </div>
      
      <form id="railway-road-form" class="help-form">
          <!-- Type Selection -->
          <div class="form-group">
            <label for="type" data-i18n="railwayRoad.type">${tr.railwayRoad.type} *</label>
            <select id="type" name="type" required>
              <option value="">${currentLang === 'si' ? 'තෝරන්න' : 'Select Type'}</option>
              <option value="railway">${tr.railwayRoad.railway}</option>
              <option value="road">${tr.railwayRoad.road}</option>
            </select>
          </div>

          <!-- Road Type (for road reports) -->
          <div class="form-group" id="road-type-group" style="display: none;">
            <label for="roadType" data-i18n="railwayRoad.roadType">${tr.railwayRoad.roadType || 'Road Type'}</label>
            <select id="roadType" name="roadType">
              <option value="">${currentLang === 'si' ? 'තෝරන්න' : 'Select Road Type'}</option>
              <option value="highway">${tr.railwayRoad.highway || 'Highway'}</option>
              <option value="main-road">${tr.railwayRoad.mainRoad || 'Main Road'}</option>
              <option value="local-road">${tr.railwayRoad.localRoad || 'Local Road'}</option>
              <option value="bridge">${tr.railwayRoad.bridge || 'Bridge'}</option>
              <option value="tunnel">${tr.railwayRoad.tunnel || 'Tunnel'}</option>
            </select>
          </div>

          <!-- Railway Line (for railway reports) -->
          <div class="form-group" id="railway-line-group" style="display: none;">
            <label for="railwayLine" data-i18n="railwayRoad.railwayLine">${tr.railwayRoad.railwayLine || 'Railway Line'}</label>
            <input type="text" id="railwayLine" name="railwayLine" placeholder="${currentLang === 'si' ? 'රේල්වේ මාර්ගය (උදා: කොළඹ-කැන්ඩි)' : 'Railway line (e.g., Colombo-Kandy)'}">
          </div>

          <!-- Severity -->
          <div class="form-group">
            <label for="severity" data-i18n="railwayRoad.severity">${tr.railwayRoad.severity} *</label>
            <select id="severity" name="severity" required>
              <option value="">${currentLang === 'si' ? 'තෝරන්න' : 'Select Severity'}</option>
              <option value="low">${tr.railwayRoad.low}</option>
              <option value="medium">${tr.railwayRoad.medium}</option>
              <option value="high">${tr.railwayRoad.high}</option>
              <option value="critical">${tr.railwayRoad.critical}</option>
            </select>
          </div>

          <!-- Location -->
          <div class="form-group">
            <label for="location" data-i18n="railwayRoad.location">${tr.railwayRoad.location} *</label>
            <div class="location-input-group">
              <input type="text" id="location" name="location" required placeholder="${tr.railwayRoad.location}">
              <button type="button" id="get-location-btn" class="get-location-btn">
                <span>📍</span>
                <span data-i18n="railwayRoad.getLocation">${tr.railwayRoad.getLocation}</span>
              </button>
            </div>
            <div id="location-status" class="location-status"></div>
            <div id="railway-road-form-map" class="map-container"></div>
            <p class="map-instruction" data-i18n="helpForm.locationDetecting">${tr.helpForm.locationDetecting || 'Click on the map to select location'}</p>
            <input type="hidden" id="latitude" name="latitude">
            <input type="hidden" id="longitude" name="longitude">
          </div>

          <!-- Reported By -->
          <div class="form-group">
            <label for="reportedBy" data-i18n="railwayRoad.reportedBy">${tr.railwayRoad.reportedBy} *</label>
            <input type="text" id="reportedBy" name="reportedBy" required placeholder="${currentLang === 'si' ? 'ඔබේ නම ඇතුළත් කරන්න...' : 'Enter your name...'}" autocomplete="name">
          </div>

          <!-- Phone (Optional) -->
          <div class="form-group">
            <label for="phone" data-i18n="railwayRoad.phone">${tr.railwayRoad.phone}</label>
            <input type="tel" id="phone" name="phone" placeholder="${currentLang === 'si' ? 'දුරකථන අංකය (උදා: 0765367297)' : 'Phone number (e.g., 0765367297)'}" autocomplete="tel">
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? '(විකල්ප) - සම්බන්ධ වීමට අවශ්‍ය නම් දුරකථන අංකය ඇතුළත් කරන්න' : '(Optional) - Enter phone number if you want responders to contact you'}</small>
          </div>

          <!-- Number of People Affected -->
          <div class="form-group">
            <label for="peopleAffected" data-i18n="railwayRoad.peopleAffected">${tr.railwayRoad.peopleAffected || 'Number of People Affected'}</label>
            <input type="number" id="peopleAffected" name="peopleAffected" min="0" placeholder="${currentLang === 'si' ? 'පීඩිත පුද්ගලයින් ගණන...' : 'Number of people affected...'}">
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? '(විකල්ප) - මාර්ග/රේල්වේ ගැටළුවෙන් පීඩාවට පත් පුද්ගලයින් ගණන' : '(Optional) - Number of people affected by road/railway issue'}</small>
          </div>

          <!-- Road Access Status -->
          <div class="form-group">
            <label for="roadAccess" data-i18n="railwayRoad.roadAccess">${tr.railwayRoad.roadAccess || 'Road Access Status'}</label>
            <select id="roadAccess" name="roadAccess">
              <option value="">${currentLang === 'si' ? 'තෝරන්න' : 'Select Status'}</option>
              <option value="accessible">${tr.railwayRoad.accessible || 'Accessible'}</option>
              <option value="partially-blocked">${tr.railwayRoad.partiallyBlocked || 'Partially Blocked'}</option>
              <option value="completely-blocked">${tr.railwayRoad.completelyBlocked || 'Completely Blocked'}</option>
            </select>
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? '(විකල්ප) - මාර්ගයට ප්‍රවේශ විය හැකි තත්වය' : '(Optional) - Current road access status'}</small>
          </div>

          <!-- Affected Distance -->
          <div class="form-group">
            <label for="affectedDistance" data-i18n="railwayRoad.affectedDistance">${tr.railwayRoad.affectedDistance || 'Affected Distance (km)'}</label>
            <input type="number" id="affectedDistance" name="affectedDistance" min="0" step="0.1" placeholder="${currentLang === 'si' ? 'පීඩිත දුර (කි.මී.)' : 'Affected distance in km'}">
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? '(විකල්ප) - අවහිර කරන ලද හෝ අවදානම් සහිත මාර්ග/රේල්වේ දුර' : '(Optional) - Distance of blocked or affected road/railway'}</small>
          </div>

          <!-- Estimated Repair Time -->
          <div class="form-group">
            <label for="estimatedRepairTime" data-i18n="railwayRoad.estimatedRepairTime">${tr.railwayRoad.estimatedRepairTime || 'Estimated Repair Time'}</label>
            <input type="text" id="estimatedRepairTime" name="estimatedRepairTime" placeholder="${currentLang === 'si' ? 'උදා: 2-3 පැය, 1 දින' : 'e.g., 2-3 hours, 1 day'}">
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? '(විකල්ප) - ඇස්තමේන්තුගත අලුත්වැඩියා කාලය' : '(Optional) - Estimated time for repairs'}</small>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" data-i18n="railwayRoad.description">${tr.railwayRoad.description} *</label>
            <textarea id="description" name="description" rows="5" required placeholder="${currentLang === 'si' ? 'විස්තරාත්මක විස්තරයක් ඇතුළත් කරන්න:\n- මාර්ග/රේල්වේ වල වත්මන් තත්වය\n- අවහිර කරන ලද ප්‍රදේශ\n- අවශ්‍ය අලුත්වැඩියාවන්\n- වෙනත් වැදගත් තොරතුරු...' : 'Enter detailed description:\n- Current situation of road/railway\n- Blocked areas\n- Required repairs\n- Any other important information...'}"></textarea>
            <small style="color: #64748b; font-size: 0.875rem; display: block; margin-top: 0.5rem;">${currentLang === 'si' ? 'කරුණාකර විස්තරාත්මක විස්තරයක් සපයන්න, එවිට අනෙක් අයට ඔබට සම්බන්ධ වීමට හෝ උදව් කිරීමට හැකි වනු ඇත' : 'Please provide detailed information so others can contact you or provide assistance'}</small>
          </div>

          <!-- Image Upload -->
          <div class="form-group">
            <label for="verification-image" class="image-upload-label">
              <span>📷</span>
              <span data-i18n="railwayRoad.image">${tr.railwayRoad.image}</span>
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

          <button type="submit" class="submit-btn" data-i18n="railwayRoad.submit">${tr.railwayRoad.submit}</button>
        </form>
        
        <div id="loading-overlay" class="loading-overlay hidden">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p class="loading-text" id="loading-text">${getCurrentLanguage() === 'si' ? 'සුරකිමින්...' : 'Saving...'}</p>
          </div>
        </div>

        <!-- Success Message -->
        <div id="success-message" class="message success-message hidden">
          <h2 data-i18n="railwayRoad.success">✅ ${tr.railwayRoad.success}</h2>
          <p data-i18n="railwayRoad.successMessage">${tr.railwayRoad.successMessage}</p>
        </div>

        <!-- Error Message -->
        <div id="error-message" class="message error-message hidden">
          <h2 data-i18n="railwayRoad.error">❌ ${tr.railwayRoad.error}</h2>
          <p data-i18n="railwayRoad.errorMessage">${tr.railwayRoad.errorMessage}</p>
        </div>
    </div>
  `
}

// Setup Railway/Road Form
export function setupRailwayRoadForm(container: HTMLElement): void {
  const form = container.querySelector<HTMLFormElement>('#railway-road-form')
  const getLocationBtn = container.querySelector<HTMLButtonElement>('#get-location-btn')
  const locationInput = container.querySelector<HTMLInputElement>('#location')
  const latitudeInput = container.querySelector<HTMLInputElement>('#latitude')
  const longitudeInput = container.querySelector<HTMLInputElement>('#longitude')
  const locationStatus = container.querySelector<HTMLElement>('#location-status')
  const successMessage = container.querySelector<HTMLElement>('#success-message')
  const errorMessage = container.querySelector<HTMLElement>('#error-message')
  const tr = t()

  if (!form || !getLocationBtn || !locationInput || !latitudeInput || !longitudeInput) return

  // Show/hide road type and railway line based on type selection
  const typeSelect = container.querySelector<HTMLSelectElement>('#type')
  const roadTypeGroup = container.querySelector<HTMLDivElement>('#road-type-group')
  const railwayLineGroup = container.querySelector<HTMLDivElement>('#railway-line-group')
  
  if (typeSelect && roadTypeGroup && railwayLineGroup) {
    typeSelect.addEventListener('change', () => {
      if (typeSelect.value === 'road') {
        roadTypeGroup.style.display = 'block'
        railwayLineGroup.style.display = 'none'
      } else if (typeSelect.value === 'railway') {
        roadTypeGroup.style.display = 'none'
        railwayLineGroup.style.display = 'block'
      } else {
        roadTypeGroup.style.display = 'none'
        railwayLineGroup.style.display = 'none'
      }
    })
  }

  // Get location button handler
  getLocationBtn.addEventListener('click', async () => {
    if (!navigator.geolocation) {
      if (locationStatus) {
        locationStatus.className = 'location-status location-status-error'
        locationStatus.textContent = tr.railwayRoad.locationError || 'Geolocation is not supported by your browser.'
        locationStatus.style.display = 'block'
      } else {
        alert(tr.railwayRoad.locationError || 'Geolocation is not supported by your browser.')
      }
      return
    }

    if (getLocationBtn) {
      getLocationBtn.disabled = true
      getLocationBtn.innerHTML = '<span>⏳</span> <span>' + (tr.railwayRoad.getLocation || 'Getting Location...') + '</span>'
    }

    if (locationStatus) {
      locationStatus.className = 'location-status location-status-loading'
      locationStatus.textContent = tr.railwayRoad.locationDetecting || 'Detecting location...'
      locationStatus.style.display = 'block'
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude

      if (!isWithinSriLanka(lat, lng)) {
        if (locationStatus) {
          locationStatus.className = 'location-status location-status-error'
          locationStatus.textContent = tr.railwayRoad.locationError || 'Your location is outside Sri Lanka. Please click on the map to select a location within Sri Lanka.'
          locationStatus.style.display = 'block'
        } else {
          alert(tr.railwayRoad.locationError || 'Location must be within Sri Lanka. Please click on the map to select a location inside Sri Lanka.')
        }
        if (getLocationBtn) {
          getLocationBtn.disabled = false
          getLocationBtn.innerHTML = '<span>📍</span> <span>' + (tr.railwayRoad.getLocation || 'Get My Location') + '</span>'
        }
        return
      }

      await updateLocationFromCoordinates(lat, lng, locationInput, locationStatus, latitudeInput, longitudeInput)
      
      if (getLocationBtn) {
        getLocationBtn.disabled = false
        getLocationBtn.innerHTML = '<span>📍</span> <span>' + (tr.railwayRoad.getLocation || 'Get My Location') + '</span>'
      }
    } catch (error: any) {
      console.error('Error getting location:', error)
      const currentLang = getCurrentLanguage()
      let errorMessage = tr.railwayRoad.locationError || 'Unable to get your location. Please click on the map to set your location.'
      
      if (error && typeof error.code === 'number') {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = currentLang === 'si' 
              ? 'ස්ථානයට ප්‍රවේශය ප්‍රතික්ෂේප කරන ලදී. කරුණාකර ඔබේ බ්‍රවුසර සැකසීම් වලින් ස්ථානයට ප්‍රවේශය සක්‍රිය කරන්න.'
              : 'Location access denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = currentLang === 'si'
              ? 'ස්ථාන තොරතුරු ලබා ගත නොහැකිය. කරුණාකර සිතියමේ ස්ථානයක් තෝරන්න.'
              : 'Location information unavailable. Please select a location on the map.'
            break
          case error.TIMEOUT:
            errorMessage = currentLang === 'si'
              ? 'ස්ථානය ලබා ගැනීමේ කාලය ඉක්මවා ගියේය. කරුණාකර නැවත උත්සාහ කරන්න.'
              : 'Location request timed out. Please try again.'
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
        getLocationBtn.innerHTML = '<span>📍</span> <span>' + (tr.railwayRoad.getLocation || 'Get My Location') + '</span>'
      }
    }
  })

  // Phone number formatting
  const phoneInput = container.querySelector<HTMLInputElement>('#phone')
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      const formatted = formatPhoneNumber(target.value)
      if (formatted !== target.value) {
        target.value = formatted
      }
    })
  }

  // Image upload handler
  const imageInput = container.querySelector<HTMLInputElement>('#verification-image')
  const imagePreviewContainer = container.querySelector<HTMLElement>('#image-preview-container')
  const imagePreview = container.querySelector<HTMLImageElement>('#image-preview')
  const removeImageBtn = container.querySelector<HTMLButtonElement>('#remove-image-btn')
  let imageBase64: string | null = null
  const currentLang = getCurrentLanguage()

  if (imageInput && imagePreviewContainer && imagePreview && removeImageBtn) {
    imageInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert(currentLang === 'si' ? 'රූපයේ ප්‍රමාණය 5MB ට වඩා විශාලයි. කරුණාකර කුඩා රූපයක් තෝරන්න.' : 'Image size is larger than 5MB. Please select a smaller image.')
          imageInput.value = ''
          return
        }

        if (!file.type.startsWith('image/')) {
          alert(currentLang === 'si' ? 'කරුණාකර රූප ගොනුවක් තෝරන්න.' : 'Please select an image file.')
          imageInput.value = ''
          return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
          imageBase64 = event.target?.result as string
          imagePreview.src = imageBase64
          imagePreviewContainer.style.display = 'block'
        }
        reader.readAsDataURL(file)
      }
    })

    removeImageBtn.addEventListener('click', () => {
      imageBase64 = null
      imagePreview.src = ''
      imagePreviewContainer.style.display = 'none'
      if (imageInput) imageInput.value = ''
    })
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const loadingOverlay = container.querySelector<HTMLElement>('#loading-overlay')
    if (loadingOverlay) loadingOverlay.classList.remove('hidden')

    if (successMessage) successMessage.classList.add('hidden')
    if (errorMessage) errorMessage.classList.add('hidden')

    const type = (container.querySelector<HTMLSelectElement>('#type')?.value || '') as 'railway' | 'road'
    const severity = (container.querySelector<HTMLSelectElement>('#severity')?.value || '') as 'low' | 'medium' | 'high' | 'critical'
    const location = locationInput.value.trim()
    const latitude = parseFloat(latitudeInput.value)
    const longitude = parseFloat(longitudeInput.value)
    const reportedBy = (container.querySelector<HTMLInputElement>('#reportedBy')?.value || '').trim()
    const phone = (container.querySelector<HTMLInputElement>('#phone')?.value || '').trim()
    const description = (container.querySelector<HTMLTextAreaElement>('#description')?.value || '').trim()
    const roadType = container.querySelector<HTMLSelectElement>('#roadType')?.value
    const railwayLine = (container.querySelector<HTMLInputElement>('#railwayLine')?.value || '').trim()
    const peopleAffected = container.querySelector<HTMLInputElement>('#peopleAffected')?.value
    const roadAccess = container.querySelector<HTMLSelectElement>('#roadAccess')?.value
    const affectedDistance = container.querySelector<HTMLInputElement>('#affectedDistance')?.value
    const estimatedRepairTime = (container.querySelector<HTMLInputElement>('#estimatedRepairTime')?.value || '').trim()

    // Validation
    // Phone is optional; only require core fields
    if (!type || !severity || !location || !latitude || !longitude || !description || !reportedBy) {
      if (errorMessage) {
        errorMessage.classList.remove('hidden')
        errorMessage.querySelector('p')!.textContent = tr.railwayRoad.locationRequired || 'Please fill in all required fields.'
      }
      if (loadingOverlay) loadingOverlay.classList.add('hidden')
      return
    }

    // Phone is optional, but if provided, validate format
    if (phone && !validatePhoneNumber(phone)) {
      if (errorMessage) {
        errorMessage.classList.remove('hidden')
        errorMessage.querySelector('p')!.textContent = tr.railwayRoad.phoneInvalid || 'Please enter a valid Sri Lankan phone number.'
      }
      if (loadingOverlay) loadingOverlay.classList.add('hidden')
      return
    }

    if (!isWithinSriLanka(latitude, longitude)) {
      if (errorMessage) {
        errorMessage.classList.remove('hidden')
        errorMessage.querySelector('p')!.textContent = tr.railwayRoad.locationError || 'Location must be within Sri Lanka.'
      }
      if (loadingOverlay) loadingOverlay.classList.add('hidden')
      return
    }

    try {
      // Build enhanced description with additional details (same model as Flood/Landslide)
      let enhancedDescription = description
      const additionalDetails: string[] = []
      
      if (peopleAffected) {
        additionalDetails.push(`${getCurrentLanguage() === 'si' ? 'පීඩිත පුද්ගලයින්' : 'People Affected'}: ${peopleAffected}`)
      }
      if (roadAccess) {
        const roadAccessLabels: Record<string, string> = {
          'accessible': getCurrentLanguage() === 'si' ? 'ප්‍රවේශ විය හැකි' : 'Accessible',
          'partially-blocked': getCurrentLanguage() === 'si' ? 'අර්ධ වශයෙන් අවහිර' : 'Partially Blocked',
          'completely-blocked': getCurrentLanguage() === 'si' ? 'සම්පූර්ණයෙන් අවහිර' : 'Completely Blocked'
        }
        additionalDetails.push(`${getCurrentLanguage() === 'si' ? 'මාර්ග ප්‍රවේශය' : 'Road Access'}: ${roadAccessLabels[roadAccess] || roadAccess}`)
      }
      if (roadType && type === 'road') {
        const roadTypeLabels: Record<string, string> = {
          'highway': getCurrentLanguage() === 'si' ? 'රථවාහන මාර්ගය' : 'Highway',
          'main-road': getCurrentLanguage() === 'si' ? 'ප්‍රධාන මාර්ගය' : 'Main Road',
          'local-road': getCurrentLanguage() === 'si' ? 'ප්‍රාදේශීය මාර්ගය' : 'Local Road',
          'bridge': getCurrentLanguage() === 'si' ? 'පාලම' : 'Bridge',
          'tunnel': getCurrentLanguage() === 'si' ? 'ගුහාව' : 'Tunnel'
        }
        additionalDetails.push(`${getCurrentLanguage() === 'si' ? 'මාර්ග වර්ගය' : 'Road Type'}: ${roadTypeLabels[roadType] || roadType}`)
      }
      if (railwayLine && type === 'railway') {
        additionalDetails.push(`${getCurrentLanguage() === 'si' ? 'රේල්වේ මාර්ගය' : 'Railway Line'}: ${railwayLine}`)
      }
      if (affectedDistance) {
        additionalDetails.push(`${getCurrentLanguage() === 'si' ? 'පීඩිත දුර' : 'Affected Distance'}: ${affectedDistance} km`)
      }
      if (estimatedRepairTime) {
        additionalDetails.push(`${getCurrentLanguage() === 'si' ? 'ඇස්තමේන්තුගත අලුත්වැඩියා කාලය' : 'Estimated Repair Time'}: ${estimatedRepairTime}`)
      }
      
      if (additionalDetails.length > 0) {
        enhancedDescription = `${description}\n\n--- Additional Details ---\n${additionalDetails.join('\n')}`
      }

      const reportData: Omit<RailwayRoadReport, 'id' | 'timestamp'> = {
        type,
        severity,
        location,
        latitude,
        longitude,
        reportedBy,
        phone,
        description: enhancedDescription,
        image: imageBase64 || undefined,
        // Only include roadType for road type reports and if it has a value
        ...(type === 'road' && roadType ? { roadType: roadType as any } : {}),
        // Only include railwayLine for railway type reports and if it has a value
        ...(type === 'railway' && railwayLine ? { railwayLine } : {}),
        // Only include roadAccess for road type reports and if it has a value
        ...(type === 'road' && roadAccess ? { roadAccess: roadAccess as any } : {}),
        affectedDistance: affectedDistance ? parseFloat(affectedDistance) : undefined,
        estimatedRepairTime: estimatedRepairTime || undefined,
        peopleAffected: peopleAffected ? parseInt(peopleAffected) : undefined,
      }

      await submitRailwayRoadReport(reportData)

      if (loadingOverlay) loadingOverlay.classList.add('hidden')
      if (successMessage) successMessage.classList.remove('hidden')
      
      // Reset form
      form.reset()
      if (imagePreviewContainer) imagePreviewContainer.style.display = 'none'
      imageBase64 = null
      if (locationStatus) locationStatus.style.display = 'none'
      const roadTypeGroup = container.querySelector<HTMLDivElement>('#road-type-group')
      const railwayLineGroup = container.querySelector<HTMLDivElement>('#railway-line-group')
      if (roadTypeGroup) roadTypeGroup.style.display = 'none'
      if (railwayLineGroup) railwayLineGroup.style.display = 'none'
      
      // Scroll to success message
      successMessage?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch (error: any) {
      console.error('Error submitting report:', error)
      if (loadingOverlay) loadingOverlay.classList.add('hidden')
      if (errorMessage) {
        errorMessage.classList.remove('hidden')
        const errorText = errorMessage.querySelector('p')
        if (errorText) {
          errorText.textContent = error.message || tr.railwayRoad.errorMessage || 'Failed to submit report. Please try again.'
        }
      }
    }
  })

  // Initialize map
  const mapContainer = container.querySelector<HTMLDivElement>('#railway-road-form-map')
  if (mapContainer) {
    initializeRailwayRoadFormMap(mapContainer, locationInput, locationStatus, latitudeInput, longitudeInput, getLocationBtn)
  }
}

// Initialize map for Railway/Road form
function initializeRailwayRoadFormMap(
  mapContainer: HTMLDivElement,
  locationInput: HTMLInputElement | null,
  locationStatus: HTMLElement | null,
  latitudeInput: HTMLInputElement | null,
  longitudeInput: HTMLInputElement | null,
  _getLocationBtn: HTMLButtonElement | null
): void {
  try {
    const tr = t()

    if (mapContainer.hasChildNodes()) {
      mapContainer.innerHTML = ''
    }

    if (typeof google === 'undefined' || !google.maps) {
      showRailwayRoadFormMapError(mapContainer)
      return
    }

    const center = { lat: 7.8731, lng: 80.7718 } // Center of Sri Lanka

    railwayRoadFormMap = new google.maps.Map(mapContainer, {
      center: center,
      zoom: 8,
      mapTypeId: 'roadmap',
      minZoom: 7,
      maxZoom: 18,
      restriction: {
        latLngBounds: {
          north: SRI_LANKA_BOUNDS.north,
          south: SRI_LANKA_BOUNDS.south,
          east: SRI_LANKA_BOUNDS.east,
          west: SRI_LANKA_BOUNDS.west
        },
        strictBounds: false
      },
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    // Add click listener to map
    railwayRoadFormMap.addListener('click', async (e: any) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()

      if (!isWithinSriLanka(lat, lng)) {
        if (locationStatus) {
          locationStatus.className = 'location-status location-status-error'
          locationStatus.textContent = tr.railwayRoad.locationError || 'Location must be within Sri Lanka. Please select a location inside Sri Lanka.'
          locationStatus.style.display = 'block'
        }
        return
      }

      await updateLocationFromCoordinates(lat, lng, locationInput, locationStatus, latitudeInput, longitudeInput)
    })

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          if (isWithinSriLanka(lat, lng)) {
            railwayRoadFormMap.setCenter({ lat, lng })
            railwayRoadFormMap.setZoom(12)
          }
        },
        () => {
          // Ignore geolocation errors
        }
      )
    }
  } catch (error) {
    console.error('Error initializing map:', error)
    showRailwayRoadFormMapError(mapContainer)
  }
}

function showRailwayRoadFormMapError(container: HTMLDivElement): void {
  container.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #64748b;">
      <p>${getCurrentLanguage() === 'si' ? 'සිතියම පූරණය කිරීමට නොහැකිය. කරුණාකර පිටුව නැවත පූරණය කරන්න.' : 'Unable to load map. Please refresh the page.'}</p>
    </div>
  `
}

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

  // Update marker
  if (railwayRoadFormMap) {
    if (railwayRoadFormMarker) {
      railwayRoadFormMarker.setPosition({ lat, lng })
    } else {
      railwayRoadFormMarker = new google.maps.Marker({
        position: { lat, lng },
        map: railwayRoadFormMap,
        draggable: true,
        title: 'Selected Location'
      })

      railwayRoadFormMarker.addListener('dragend', async (e: any) => {
        const newLat = e.latLng.lat()
        const newLng = e.latLng.lng()
        if (isWithinSriLanka(newLat, newLng)) {
          await updateLocationFromCoordinates(newLat, newLng, locationInput, locationStatus, latitudeInput, longitudeInput)
        } else {
          const tr = t()
          if (locationStatus) {
            locationStatus.className = 'location-status location-status-error'
            locationStatus.textContent = tr.railwayRoad.locationError || 'Location must be within Sri Lanka.'
            locationStatus.style.display = 'block'
          }
        }
      })
    }

    railwayRoadFormMap.setCenter({ lat, lng })
    if (railwayRoadFormMap.getZoom() < 12) {
      railwayRoadFormMap.setZoom(12)
    }
  }

  // Try to get address from coordinates
  try {
    const { reverseGeocode } = await import('../services/api.ts')
    const result = await reverseGeocode(lat, lng)
    if (locationInput && result.formatted_address) {
      locationInput.value = result.formatted_address
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    if (locationInput) {
      locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  if (locationStatus) {
    locationStatus.className = 'location-status location-status-success'
    locationStatus.textContent = getCurrentLanguage() === 'si' ? 'ස්ථානය තෝරාගෙන ඇත' : 'Location selected'
    locationStatus.style.display = 'block'
  }
}

