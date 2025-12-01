import { t, getCurrentLanguage, setLanguage, type Language } from '../utils/i18n.ts'
import { fetchDisasterCenters, fetchStatistics, fetchHelpRequests, verifyHelpRequest, verifyDisasterCenter, fetchFloodLandslideReports, deleteFloodLandslideReport, updateFloodLandslideReport, type DisasterCenter, type Statistics, type HelpRequest, type FloodLandslideReport } from '../services/api.ts'

// Export DisasterCenter type for use in other files
export type { DisasterCenter }

// Disaster centers loaded from API
export let disasterCenters: DisasterCenter[] = []

// Help requests loaded from API
let helpRequests: HelpRequest[] = []

// Flood/Landslide reports loaded from API
let floodLandslideReports: FloodLandslideReport[] = []

// Statistics loaded from API (stored for potential future use)
// let dashboardStatistics: Statistics | null = null

// Load centers from API
export async function loadDisasterCenters(): Promise<void> {
  try {
    disasterCenters = await fetchDisasterCenters()
  } catch (error) {
    console.error('Error loading disaster centers:', error)
    disasterCenters = [] // Set to empty array on error
  }
}

// Refresh centers from API
export async function refreshDisasterCenters(): Promise<void> {
  await loadDisasterCenters()
}

// Declare Google Maps
declare const google: any

let dashboardMap: any = null
let markers: any[] = []
let helpRequestMarkers: any[] = [] // Track help request markers separately
let floodLandslideMarkers: any[] = [] // Track flood/landslide markers separately
let currentInfoWindow: any = null // Track currently open InfoWindow
let markerJustClicked: boolean = false // Flag to prevent map click from closing just-opened InfoWindow
let dashboardContainer: HTMLElement | null = null // Store dashboard container for verification

// Create Dashboard HTML
export function createDashboardHTML(): string {
  // Calculate statistics from loaded centers (will be updated from API)
  const activeCenters = disasterCenters.filter(c => c.status === 'active').length
  const totalCapacity = disasterCenters.reduce((sum, c) => sum + c.capacity, 0)
  const limitedCenters = disasterCenters.filter(c => c.status === 'limited').length
  const currentLang = getCurrentLanguage()
  const tr = t()

  return `
    <div class="dashboard">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>🌊 Flood Relief</h2>
          <p>Sri Lanka</p>
        </div>
        <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle menu">
          <span>☰</span>
        </button>
        <nav class="sidebar-nav" id="sidebar-nav">
          <a href="#" class="nav-item active" data-view="overview">
            <span>📊</span>
            <span data-i18n="sidebar.overview">${tr.sidebar.overview}</span>
          </a>
          <a href="#" class="nav-item" data-view="centers">
            <span>🏢</span>
            <span data-i18n="sidebar.disasterCenters">${tr.sidebar.disasterCenters}</span>
          </a>
          <a href="#" class="nav-item" data-view="requests">
            <span>📋</span>
            <span data-i18n="sidebar.helpRequests">${tr.sidebar.helpRequests}</span>
          </a>
          <a href="#" class="nav-item" id="request-help-nav">
            <span>📝</span>
            <span data-i18n="sidebar.requestHelp">${tr.sidebar.requestHelp}</span>
          </a>
          <a href="#" class="nav-item" id="create-center-nav">
            <span>➕</span>
            <span data-i18n="sidebar.createCenter">${tr.sidebar.createCenter || 'Create Center'}</span>
          </a>
          <a href="#" class="nav-item" data-view="flood-landslide">
            <span>🌊</span>
            <span data-i18n="sidebar.floodLandslideReports">${tr.sidebar.floodLandslideReports || 'Flood/Landslide Reports'}</span>
          </a>
          <a href="#" class="nav-item" id="report-flood-landslide-nav">
            <span>📝</span>
            <span data-i18n="sidebar.reportFloodLandslide">${tr.sidebar.reportFloodLandslide || 'Report Flood/Landslide'}</span>
          </a>
          <div class="language-switcher">
            <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button class="lang-btn ${currentLang === 'si' ? 'active' : ''}" data-lang="si">
              <span>🇱🇰</span>
              <span>සිංහල</span>
            </button>
          </div>
        </nav>
      </aside>
      <main class="main-content">
        <header class="topbar">
          <div class="topbar-left">
            <h1 data-i18n="dashboard.title">${tr.dashboard.title}</h1>
            <p class="topbar-subtitle" data-i18n="dashboard.subtitle">${tr.dashboard.subtitle}</p>
          </div>
          <div class="topbar-right">
            <!-- Language switcher for mobile (visible on mobile, hidden on desktop) -->
            <div class="language-switcher-mobile">
              <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en">
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button class="lang-btn ${currentLang === 'si' ? 'active' : ''}" data-lang="si">
                <span>🇱🇰</span>
                <span>සිංහල</span>
              </button>
            </div>
            <button id="refresh-btn" class="icon-btn" title="${tr.dashboard.refresh}">
              <span>🔄</span>
            </button>
            <button id="request-help-btn" class="primary-btn">
              <span>➕</span>
              <span data-i18n="dashboard.requestHelp">${tr.dashboard.requestHelp}</span>
            </button>
            <button id="report-flood-landslide-btn" class="primary-btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <span>🌊</span>
              <span data-i18n="dashboard.reportFloodLandslide">${tr.dashboard.reportFloodLandslide || 'Report Flood/Landslide'}</span>
            </button>
          </div>
        </header>

        <section class="stats-section">
          <div class="stat-card">
            <div class="stat-icon stat-primary">🏢</div>
            <div class="stat-content">
              <h3 class="stat-value">${disasterCenters.length}</h3>
              <p class="stat-label" data-i18n="stats.totalCenters">${tr.stats.totalCenters}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-success">✓</div>
            <div class="stat-content">
              <h3 class="stat-value">${activeCenters}</h3>
              <p class="stat-label" data-i18n="stats.activeCenters">${tr.stats.activeCenters}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-warning">⚠</div>
            <div class="stat-content">
              <h3 class="stat-value">${limitedCenters}</h3>
              <p class="stat-label" data-i18n="stats.limitedCapacity">${tr.stats.limitedCapacity}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-info">👥</div>
            <div class="stat-content">
              <h3 class="stat-value">${totalCapacity.toLocaleString()}</h3>
              <p class="stat-label" data-i18n="stats.totalCapacity">${tr.stats.totalCapacity}</p>
            </div>
          </div>
        </section>

        <section class="content-section" id="overview-section">
          <div class="section-header">
            <h2 data-i18n="map.title">📍 ${tr.map.title}</h2>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="map-legend">
                <span class="legend-item"><span class="legend-dot active"></span> <span data-i18n="map.active">${tr.map.active}</span></span>
                <span class="legend-item"><span class="legend-dot limited"></span> <span data-i18n="map.limited">${tr.map.limited}</span></span>
                <span class="legend-item"><span class="legend-dot full"></span> <span data-i18n="map.full">${tr.map.full}</span></span>
                <span class="legend-item"><span class="legend-dot help-request"></span> <span data-i18n="map.helpRequests">${tr.map.helpRequests || 'Help Requests'}</span></span>
              </div>
              <button id="map-fullscreen-btn" class="map-fullscreen-btn" title="${tr.map.fullscreen || 'Full Screen'}" style="background: #667eea; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;">
                <span>⛶</span>
                <span data-i18n="map.fullscreen">${tr.map.fullscreen || 'Full Screen'}</span>
              </button>
            </div>
          </div>
          <div id="dashboard-map" class="map"></div>
          <div id="map-fullscreen-container" class="map-fullscreen-container" style="display: none;">
            <div class="map-fullscreen-header">
              <h2 data-i18n="map.title">📍 ${tr.map.title}</h2>
              <button id="map-fullscreen-close-btn" class="map-fullscreen-close-btn" title="${tr.map.exitFullscreen || 'Exit Full Screen'}" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>✕</span>
                <span data-i18n="map.exitFullscreen">${tr.map.exitFullscreen || 'Exit Full Screen'}</span>
              </button>
            </div>
            <div id="dashboard-map-fullscreen" class="map-fullscreen"></div>
          </div>
        </section>

        <section class="content-section" id="centers-section" style="display: none;">
          <div class="section-header">
            <h2 data-i18n="centers.title">🏢 ${tr.centers.title}</h2>
            <input type="text" id="search-centers" class="search-input" placeholder="${tr.centers.search}" data-i18n-placeholder="centers.search">
          </div>
          <div class="table-wrapper">
            <table class="centers-table">
              <thead>
                <tr>
                  <th data-i18n="centers.name">${tr.centers.name}</th>
                  <th data-i18n="centers.location">${tr.centers.location}</th>
                  <th data-i18n="centers.phone">${tr.centers.phone}</th>
                  <th data-i18n="centers.capacity">${tr.centers.capacity}</th>
                  <th data-i18n="centers.status">${tr.centers.status}</th>
                  <th data-i18n="centers.services">${tr.centers.services}</th>
                  <th data-i18n="centers.additionalInfo">${tr.centers.additionalInfo || 'Additional Information'}</th>
                  <th data-i18n="centers.actions">${tr.centers.actions}</th>
                </tr>
              </thead>
              <tbody id="centers-table-body"></tbody>
            </table>
          </div>
        </section>

        <section class="content-section" id="requests-section" style="display: none;">
          <div class="section-header">
            <h2 data-i18n="requests.title">📋 ${tr.requests.title}</h2>
          </div>
          <!-- Desktop Table View -->
          <div class="table-container requests-table-desktop">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th data-i18n="requests.name">${tr.requests.name}</th>
                  <th data-i18n="requests.phone">${tr.requests.phone}</th>
                  <th data-i18n="requests.location">${tr.requests.location}</th>
                  <th data-i18n="requests.people">${tr.requests.people}</th>
                  <th data-i18n="requests.needs">${tr.requests.needs}</th>
                  <th>Urgency</th>
                  <th>Date</th>
                  <th data-i18n="requests.verificationStatus">${tr.requests.verificationStatus || 'Verification'}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="requests-table-body">
              </tbody>
            </table>
          </div>
          <!-- Mobile Card View -->
          <div id="requests-mobile-grid" class="requests-mobile-grid">
          </div>
        </section>

        <section class="content-section" id="flood-landslide-section" style="display: none;">
          <div class="section-header">
            <h2 data-i18n="floodLandslide.reports">🌊 ${tr.floodLandslide.reports}</h2>
          </div>
          <!-- Desktop Table View -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th data-i18n="floodLandslide.type">${tr.floodLandslide.type}</th>
                  <th data-i18n="floodLandslide.location">${tr.floodLandslide.location}</th>
                  <th data-i18n="floodLandslide.severity">${tr.floodLandslide.severity}</th>
                  <th data-i18n="floodLandslide.description">${tr.floodLandslide.description}</th>
                  <th data-i18n="floodLandslide.reportedBy">${tr.floodLandslide.reportedBy}</th>
                  <th data-i18n="floodLandslide.date">${tr.floodLandslide.date || 'Date'}</th>
                  <th data-i18n="floodLandslide.action">${tr.floodLandslide.action || 'Action'}</th>
                </tr>
              </thead>
              <tbody id="flood-landslide-table-body">
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `
}

// Setup Dashboard
export async function setupDashboard(container: HTMLElement, showFormCallback: () => void, showCreateCenterCallback?: () => void, showFloodLandslideCallback?: () => void): Promise<void> {
  const mapContainer = container.querySelector<HTMLDivElement>('#dashboard-map')
  const requestHelpNav = container.querySelector<HTMLAnchorElement>('#request-help-nav')
  const requestHelpBtn = container.querySelector<HTMLButtonElement>('#request-help-btn')
  const createCenterNav = container.querySelector<HTMLAnchorElement>('#create-center-nav')
  const reportFloodLandslideNav = container.querySelector<HTMLAnchorElement>('#report-flood-landslide-nav')
  const navItems = container.querySelectorAll<HTMLAnchorElement>('.nav-item[data-view]')
  const searchInput = container.querySelector<HTMLInputElement>('#search-centers')

  // Navigation handlers
  if (requestHelpNav) {
    requestHelpNav.addEventListener('click', (e) => {
      e.preventDefault()
      showFormCallback()
    })
  }

  if (requestHelpBtn) {
    requestHelpBtn.addEventListener('click', () => {
      showFormCallback()
    })
  }

  if (createCenterNav && showCreateCenterCallback) {
    createCenterNav.addEventListener('click', (e) => {
      e.preventDefault()
      showCreateCenterCallback()
    })
  }

  if (reportFloodLandslideNav && showFloodLandslideCallback) {
    reportFloodLandslideNav.addEventListener('click', (e) => {
      e.preventDefault()
      showFloodLandslideCallback()
    })
  }

  const reportFloodLandslideBtn = container.querySelector<HTMLButtonElement>('#report-flood-landslide-btn')
  if (reportFloodLandslideBtn && showFloodLandslideCallback) {
    reportFloodLandslideBtn.addEventListener('click', () => {
      showFloodLandslideCallback()
    })
  }

  // Mobile menu toggle - Enhanced for mobile browsers
  const mobileMenuToggle = container.querySelector<HTMLButtonElement>('#mobile-menu-toggle')
  const sidebarNav = container.querySelector<HTMLElement>('#sidebar-nav')
  
  if (mobileMenuToggle && sidebarNav) {
    // Prevent event listener duplication
    const newToggle = mobileMenuToggle.cloneNode(true) as HTMLButtonElement
    mobileMenuToggle.parentNode?.replaceChild(newToggle, mobileMenuToggle)
    
    newToggle.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const isActive = sidebarNav.classList.toggle('active')
      newToggle.classList.toggle('active', isActive)
      console.log('Menu toggled:', isActive) // Debug log
    })
    
    // Touch event for better mobile support
    newToggle.addEventListener('touchend', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const isActive = sidebarNav.classList.toggle('active')
      newToggle.classList.toggle('active', isActive)
    })
    
    // Close menu when clicking outside
    const closeMenuOnOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (window.innerWidth <= 768 && 
          sidebarNav.classList.contains('active') &&
          !sidebarNav.contains(target) &&
          !newToggle.contains(target)) {
        sidebarNav.classList.remove('active')
        newToggle.classList.remove('active')
      }
    }
    
    // Use capture phase for better mobile support
    document.addEventListener('click', closeMenuOnOutsideClick, true)
    document.addEventListener('touchend', closeMenuOnOutsideClick, true)
  }
  
  // Sidebar navigation
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault()
      const view = item.dataset.view
      
      navItems.forEach(nav => nav.classList.remove('active'))
      item.classList.add('active')
      
      // Close mobile menu after selection
      const currentSidebarNav = container.querySelector<HTMLElement>('#sidebar-nav')
      const currentMobileToggle = container.querySelector<HTMLButtonElement>('#mobile-menu-toggle')
      if (currentSidebarNav && window.innerWidth <= 768) {
        currentSidebarNav.classList.remove('active')
        if (currentMobileToggle) {
          currentMobileToggle.classList.remove('active')
        }
      }
      
      const sections = container.querySelectorAll<HTMLElement>('.content-section')
      sections.forEach(section => {
        section.style.display = 'none'
      })
      
      if (view === 'overview') {
        const overviewSection = container.querySelector<HTMLElement>('#overview-section')
        if (overviewSection) overviewSection.style.display = 'block'
      } else if (view === 'centers') {
        const centersSection = container.querySelector<HTMLElement>('#centers-section')
        if (centersSection) centersSection.style.display = 'block'
      } else if (view === 'requests') {
        const requestsSection = container.querySelector<HTMLElement>('#requests-section')
        if (requestsSection) requestsSection.style.display = 'block'
      } else if (view === 'flood-landslide') {
        const floodLandslideSection = container.querySelector<HTMLElement>('#flood-landslide-section')
        if (floodLandslideSection) {
          floodLandslideSection.style.display = 'block'
          displayFloodLandslideReports(container)
        }
      }
    })
    
    // Add touch support for mobile browsers
    item.addEventListener('touchend', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const view = item.dataset.view
      
      navItems.forEach(nav => nav.classList.remove('active'))
      item.classList.add('active')
      
      const currentSidebarNav = container.querySelector<HTMLElement>('#sidebar-nav')
      const currentMobileToggle = container.querySelector<HTMLButtonElement>('#mobile-menu-toggle')
      if (currentSidebarNav && window.innerWidth <= 768) {
        currentSidebarNav.classList.remove('active')
        if (currentMobileToggle) {
          currentMobileToggle.classList.remove('active')
        }
      }
      
      const sections = container.querySelectorAll<HTMLElement>('.content-section')
      sections.forEach(section => {
        section.style.display = 'none'
      })
      
      if (view === 'overview') {
        const overviewSection = container.querySelector<HTMLElement>('#overview-section')
        if (overviewSection) overviewSection.style.display = 'block'
      } else if (view === 'centers') {
        const centersSection = container.querySelector<HTMLElement>('#centers-section')
        if (centersSection) centersSection.style.display = 'block'
      } else if (view === 'requests') {
        const requestsSection = container.querySelector<HTMLElement>('#requests-section')
        if (requestsSection) requestsSection.style.display = 'block'
      }
    }, { passive: false })
  })

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = (e.target as HTMLInputElement).value.toLowerCase()
      filterCentersTable(searchTerm)
    })
  }

  // Store container for use in marker handlers
  dashboardContainer = container

  // Load data from API
  loadDashboardData(container)

  // Initialize map with error handling
  if (mapContainer) {
    if (typeof google !== 'undefined' && google.maps) {
      initializeMap(mapContainer)
    } else if ((window as any).googleMapsError) {
      showMapError(mapContainer, 'Google Maps failed to load. Please check your API key configuration.')
    } else {
      // Wait for Google Maps to load
      let attempts = 0
      const maxAttempts = 50 // 5 seconds max wait
      
      const checkGoogleMaps = setInterval(() => {
        attempts++
        
        if ((window as any).googleMapsError) {
          clearInterval(checkGoogleMaps)
          showMapError(mapContainer, 'Google Maps authentication failed. Please check your API key.')
        } else if (typeof google !== 'undefined' && google.maps) {
          clearInterval(checkGoogleMaps)
          initializeMap(mapContainer)
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogleMaps)
          showMapError(mapContainer, 'Google Maps failed to load. Please check your internet connection and API key.')
        }
      }, 100)
      
      // Also listen for the custom event
      window.addEventListener('googlemapsloaded', () => {
        clearInterval(checkGoogleMaps)
        if (mapContainer && typeof google !== 'undefined' && google.maps) {
          initializeMap(mapContainer)
        }
      }, { once: true })
      
      window.addEventListener('googlemapserror', () => {
        clearInterval(checkGoogleMaps)
        showMapError(mapContainer, 'Google Maps authentication failed. Please check your API key.')
      }, { once: true })
    }
  }

  // Display tables (will be updated after data loads)
  displayCentersTable()
  loadHelpRequests(container)

  // Refresh button
  const refreshBtn = container.querySelector<HTMLButtonElement>('#refresh-btn')
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true
      refreshBtn.innerHTML = '<span>⏳</span>'
      try {
        await loadDashboardData(container)
        await loadHelpRequests(container)
        displayCentersTable()
      } catch (error) {
        console.error('Error refreshing data:', error)
        alert('Failed to refresh data. Please try again.')
      } finally {
        refreshBtn.disabled = false
        refreshBtn.innerHTML = '<span>🔄</span>'
      }
    })
  }

  // Language switcher
  setupLanguageSwitcher(container, showFormCallback, showCreateCenterCallback, showFloodLandslideCallback)
  
  // Load flood/landslide reports
  await loadFloodLandslideReports(container)

  // Setup fullscreen map functionality
  setupMapFullscreen(container)
}

// Setup fullscreen map functionality
function setupMapFullscreen(container: HTMLElement): void {
  const fullscreenBtn = container.querySelector<HTMLButtonElement>('#map-fullscreen-btn')
  const fullscreenContainer = container.querySelector<HTMLDivElement>('#map-fullscreen-container')
  const fullscreenCloseBtn = container.querySelector<HTMLButtonElement>('#map-fullscreen-close-btn')
  const fullscreenMapContainer = container.querySelector<HTMLDivElement>('#dashboard-map-fullscreen')

  if (!fullscreenBtn || !fullscreenContainer || !fullscreenCloseBtn || !fullscreenMapContainer) return

  let fullscreenMap: any = null

  fullscreenBtn.addEventListener('click', () => {
    fullscreenContainer.style.display = 'block'
    document.body.style.overflow = 'hidden'

    // Initialize map in fullscreen container if not already initialized
    if (!fullscreenMap && typeof google !== 'undefined' && google.maps) {
      const currentCenter = dashboardMap ? dashboardMap.getCenter() : { lat: 7.8731, lng: 80.7718 }
      const currentZoom = dashboardMap ? dashboardMap.getZoom() : 8
      
      fullscreenMap = new google.maps.Map(fullscreenMapContainer, {
        center: currentCenter,
        zoom: currentZoom,
        mapTypeId: dashboardMap ? dashboardMap.getMapTypeId() : 'roadmap',
        minZoom: 7,
        maxZoom: 18,
        restriction: {
          latLngBounds: {
            north: 9.8,
            south: 5.9,
            east: 81.9,
            west: 79.7
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

      // Copy markers to fullscreen map
      if (dashboardMap) {
        markers.forEach(marker => {
          const position = marker.getPosition()
          const newMarker = new google.maps.Marker({
            position: position,
            map: fullscreenMap,
            icon: marker.getIcon(),
            title: marker.getTitle()
          })
          
          // Copy click listeners if any
          const infoWindow = marker.get('infoWindow')
          if (infoWindow) {
            newMarker.addListener('click', () => {
              infoWindow.open(fullscreenMap, newMarker)
            })
          }
        })

        helpRequestMarkers.forEach(marker => {
          const position = marker.getPosition()
          const newMarker = new google.maps.Marker({
            position: position,
            map: fullscreenMap,
            icon: marker.getIcon(),
            title: marker.getTitle()
          })
          
          const infoWindow = marker.get('infoWindow')
          if (infoWindow) {
            newMarker.addListener('click', () => {
              infoWindow.open(fullscreenMap, newMarker)
            })
          }
        })
      }
    } else if (fullscreenMap && dashboardMap) {
      // Update existing fullscreen map to match current dashboard map
      fullscreenMap.setCenter(dashboardMap.getCenter())
      fullscreenMap.setZoom(dashboardMap.getZoom())
    }
  })

  fullscreenCloseBtn.addEventListener('click', () => {
    fullscreenContainer.style.display = 'none'
    document.body.style.overflow = ''
  })

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenContainer.style.display === 'block') {
      fullscreenContainer.style.display = 'none'
      document.body.style.overflow = ''
    }
  })
}

// Load all dashboard data from API
async function loadDashboardData(container: HTMLElement): Promise<void> {
  try {
    // Load centers and statistics in parallel
    const [, stats] = await Promise.all([
      loadDisasterCenters(),
      fetchStatistics().catch(() => null) // Continue even if stats fail
    ])

    // Update statistics if available
    if (stats) {
      // dashboardStatistics = stats
      updateStatisticsDisplay(container, stats)
    } else {
      // Calculate from centers if stats API fails
      updateStatisticsFromCenters(container)
    }

    // Update centers table and map
    displayCentersTable()
    const mapContainer = container.querySelector<HTMLDivElement>('#dashboard-map')
    if (mapContainer && typeof google !== 'undefined' && google.maps) {
      initializeMap(mapContainer)
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    // Show error message to user
    const statsSection = container.querySelector('.stats-section')
    if (statsSection) {
      statsSection.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">Failed to load data. Please check your connection and try again.</p>'
    }
  }
}

// Update statistics display from API statistics
function updateStatisticsDisplay(container: HTMLElement, stats: Statistics): void {
  const statCards = container.querySelectorAll('.stat-value')
  if (statCards.length >= 4) {
    statCards[0].textContent = stats.totalCenters.toString()
    statCards[1].textContent = stats.activeCenters.toString()
    statCards[2].textContent = stats.limitedCenters.toString()
    statCards[3].textContent = stats.totalCapacity.toLocaleString()
  }
}

// Update statistics from centers data (fallback)
function updateStatisticsFromCenters(container: HTMLElement): void {
  const activeCenters = disasterCenters.filter(c => c.status === 'active').length
  const limitedCenters = disasterCenters.filter(c => c.status === 'limited').length
  const totalCapacity = disasterCenters.reduce((sum, c) => sum + c.capacity, 0)
  
  const statCards = container.querySelectorAll('.stat-value')
  if (statCards.length >= 4) {
    statCards[0].textContent = disasterCenters.length.toString()
    statCards[1].textContent = activeCenters.toString()
    statCards[2].textContent = limitedCenters.toString()
    statCards[3].textContent = totalCapacity.toLocaleString()
  }
}

// Load help requests from API
async function loadHelpRequests(container: HTMLElement): Promise<void> {
  try {
    const response = await fetchHelpRequests({ limit: 100, sort: 'timestamp', order: 'desc' })
    helpRequests = response.data.filter(req => req.latitude && req.longitude) // Only requests with coordinates
    displayHelpRequests(container, response.data)
    
    // Update map with help request markers if map is already initialized
    // Clear old help request markers first to avoid duplicates
    if (dashboardMap && typeof google !== 'undefined' && google.maps) {
      // Store help request markers before clearing
      const oldHelpRequestMarkers = [...helpRequestMarkers]
      
      // Remove old help request markers from map
      oldHelpRequestMarkers.forEach(marker => {
        marker.setMap(null)
      })
      
      // Remove old help request markers from main markers array
      markers = markers.filter(m => !oldHelpRequestMarkers.includes(m))
      
      // Clear the help request markers array
      helpRequestMarkers = []
    }
    
    // Don't change camera position - just add markers
    const mapContainer = container.querySelector<HTMLDivElement>('#dashboard-map')
    if (mapContainer && dashboardMap && typeof google !== 'undefined' && google.maps) {
      addHelpRequestMarkersToMap()
      // Keep default camera position - don't auto-zoom
      if (dashboardMap) {
        dashboardMap.setCenter({ lat: 7.8731, lng: 80.7718 })
        dashboardMap.setZoom(8)
      }
    }
  } catch (error) {
    console.error('Error loading help requests:', error)
    helpRequests = []
    displayHelpRequests(container, []) // Show empty state
  }
}

// Setup language switcher (handles both sidebar and topbar language buttons)
function setupLanguageSwitcher(container: HTMLElement, showFormCallback: () => void, showCreateCenterCallback?: () => void, showFloodLandslideCallback?: () => void): void {
  // Get all language buttons (both sidebar and topbar)
  const langButtons = container.querySelectorAll<HTMLButtonElement>('.lang-btn')
  
  langButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang as Language
      setLanguage(lang)
      // Reload dashboard with new language
      const app = document.querySelector<HTMLDivElement>('#app')
      if (app) {
        app.innerHTML = createDashboardHTML()
        await setupDashboard(app, showFormCallback, showCreateCenterCallback, showFloodLandslideCallback)
      }
    })
  })
}

// Show map error message
function showMapError(mapContainer: HTMLDivElement, message: string): void {
  mapContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center; background: #f8f9fa; border-radius: 8px; border: 2px dashed #dee2e6;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
      <h3 style="color: #dc3545; margin-bottom: 0.5rem;">Map Loading Error</h3>
      <p style="color: #6c757d; margin-bottom: 1rem;">${message}</p>
      <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 1rem; margin-top: 1rem; max-width: 500px;">
        <p style="margin: 0; color: #856404; font-size: 0.875rem;">
          <strong>Possible solutions:</strong><br>
          1. Check if Google Maps JavaScript API is enabled in Google Cloud Console<br>
          2. Verify API key restrictions allow your domain<br>
          3. Check API key billing status<br>
          4. Ensure internet connection is active
        </p>
      </div>
      <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
        🔄 Retry
      </button>
    </div>
  `
}

// Initialize Google Map
function initializeMap(mapContainer: HTMLDivElement): void {
  try {
    // Clear existing map
    if (mapContainer.hasChildNodes()) {
      mapContainer.innerHTML = ''
    }

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    markers = []

    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps not loaded')
      showMapError(mapContainer, 'Google Maps library is not available.')
      return
    }

    // Initialize Google Map with default camera position (center of Sri Lanka)
    try {
      dashboardMap = new google.maps.Map(mapContainer, {
        center: { lat: 7.8731, lng: 80.7718 }, // Center of Sri Lanka
        zoom: 8, // Default zoom level to show entire country
        mapTypeId: 'roadmap',
        minZoom: 7, // Prevent zooming out too far
        maxZoom: 18, // Prevent zooming in too close
        restriction: {
          latLngBounds: {
            north: 9.8,
            south: 5.9,
            east: 81.9,
            west: 79.7
          },
          strictBounds: false // Allow some panning outside bounds
        },
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })
      
      // Explicitly set default camera position (center of Sri Lanka)
      dashboardMap.setCenter({ lat: 7.8731, lng: 80.7718 })
      dashboardMap.setZoom(8)
      
      // Close InfoWindow when clicking on the map (not on markers)
      dashboardMap.addListener('click', () => {
        // Don't close if a marker was just clicked (it will open its own InfoWindow)
        if (markerJustClicked) {
          markerJustClicked = false
          return
        }
        if (currentInfoWindow) {
          currentInfoWindow.close()
          currentInfoWindow = null
        }
      })
    } catch (error) {
      console.error('Error initializing Google Map:', error)
      showMapError(mapContainer, `Error initializing map: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return
    }

    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds()

    // Add markers for each disaster center
    const tr = t()
    
    // Add help request markers first (so they appear below center markers)
    addHelpRequestMarkersToMap(bounds)
    
    // Add flood/landslide markers
    addFloodLandslideMarkersToMap(bounds)
    
    disasterCenters.forEach(center => {
      const color = center.status === 'active' ? '#28a745' : center.status === 'limited' ? '#ffc107' : '#dc3545'
      
      // Create custom marker icon
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }

      // Create marker
      const marker = new google.maps.Marker({
        position: { lat: center.latitude, lng: center.longitude },
        map: dashboardMap,
        icon: markerIcon,
        title: center.name
      })

      // Create info window content
      const imageHtml = center.image ? `
        <div style="margin: 0 0 10px 0; border-radius: 8px; overflow: hidden;">
          <img src="${center.image}" 
               alt="${center.name}" 
               style="width: 100%; max-height: 200px; object-fit: cover; display: block; cursor: pointer;"
               onclick="window.open('${center.image}', '_blank')"
               onerror="this.style.display='none'">
        </div>
      ` : ''
      
      const additionalInfoHtml = center.additionalInfo ? `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 5px 0; color: #475569; font-weight: 600; font-size: 0.9rem;">${tr.centers.additionalInfo || 'Additional Information'}:</p>
          <p style="margin: 5px 0; color: #64748b; font-size: 0.875rem; line-height: 1.4;">${center.additionalInfo}</p>
        </div>
      ` : ''
      
      // Verification status
      const verificationStatusHtml = center.verified 
        ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #10b981; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
            ✓ ${tr.centers.verified || 'Verified'}
          </span>`
        : `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #ef4444; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
            ✗ ${tr.centers.unverified || 'Unverified'}
          </span>`
      
      const infoWindowContent = `
        <div style="padding: 10px; min-width: 250px; max-width: 350px;">
          ${imageHtml}
          <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 1.1rem;">${center.name}</h3>
          <div style="margin-bottom: 10px;">${verificationStatusHtml}</div>
          <p style="margin: 5px 0; color: #475569;">📍 ${center.address}</p>
          <p style="margin: 5px 0; color: #475569;">📞 <a href="tel:${center.phone}" style="color: #667eea; text-decoration: none;">${center.phone}</a></p>
          <p style="margin: 5px 0; color: #475569;">👥 ${tr.centers.capacity}: ${center.capacity}</p>
          <p style="margin: 5px 0; color: #475569;">${tr.centers.status}: <strong style="color: ${color};">${tr.status[center.status]}</strong></p>
          <p style="margin: 5px 0; color: #475569;">${tr.centers.services}: ${center.services.join(', ')}</p>
          ${additionalInfoHtml}
          <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
            <a href="tel:${center.phone}" style="display: inline-block; padding: 8px 16px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; flex: 1; text-align: center; min-width: 100px;">📞 ${tr.centers.call}</a>
            <a href="https://www.google.com/maps?q=${center.latitude},${center.longitude}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; flex: 1; text-align: center; min-width: 100px;">📍 ${tr.centers.viewOnMap || 'Share Location'}</a>
            ${center.id ? `
              <button class="verify-center-btn" data-id="${center.id}" data-verified="${center.verified ? 'true' : 'false'}" style="padding: 8px 16px; background: ${center.verified ? '#ef4444' : '#10b981'}; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; flex: 1; min-width: 100px;">
                ${center.verified ? '❌ ' + (tr.centers.unverify || 'Unverify') : '✓ ' + (tr.centers.verify || 'Verify')}
              </button>
            ` : ''}
          </div>
        </div>
      `

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
      })

      // Listen for InfoWindow close event
      google.maps.event.addListener(infoWindow, 'closeclick', () => {
        if (currentInfoWindow === infoWindow) {
          currentInfoWindow = null
        }
      })

      // Add click listener to marker
      marker.addListener('click', () => {
        // Set flag to prevent map click from closing this InfoWindow
        markerJustClicked = true
        
        // Close previous InfoWindow if open
        if (currentInfoWindow) {
          currentInfoWindow.close()
        }
        // Open new InfoWindow and track it
        infoWindow.open(dashboardMap, marker)
        currentInfoWindow = infoWindow
        
        // Store infoWindow with marker for fullscreen map
        marker.set('infoWindow', infoWindow)
        
        // Add verify button handler after info window is opened
        setTimeout(() => {
          const verifyBtn = document.querySelector(`.verify-center-btn[data-id="${center.id}"]`)
          if (verifyBtn) {
            verifyBtn.addEventListener('click', async (e) => {
              e.preventDefault()
              e.stopPropagation()
              
              const centerId = (verifyBtn as HTMLElement).dataset.id
              const isVerified = (verifyBtn as HTMLElement).dataset.verified === 'true'
              
              if (!centerId) return
              
              // Disable button during request
              ;(verifyBtn as HTMLButtonElement).disabled = true
              ;(verifyBtn as HTMLElement).innerHTML = '⏳'
              
              try {
                // Verify/unverify center (works without authentication)
                await verifyDisasterCenter(centerId, !isVerified)
                
                // Close info window
                if (currentInfoWindow) {
                  currentInfoWindow.close()
                }
                
                // Reload disaster centers to update the map
                if (dashboardContainer) {
                  await loadDashboardData(dashboardContainer)
                }
                
                // Show success message
                const message = !isVerified 
                  ? (tr.centers.verified || 'Center verified successfully')
                  : (tr.centers.unverified || 'Center unverified successfully')
                console.log(message)
              } catch (error: any) {
                console.error('Error verifying center:', error)
                alert(error.message || 'Failed to update verification status. Please try again.')
                ;(verifyBtn as HTMLButtonElement).disabled = false
                ;(verifyBtn as HTMLElement).innerHTML = isVerified ? (tr.centers.unverify || 'Unverify') : (tr.centers.verify || 'Verify')
              }
            })
          }
        }, 100)
        
        // Reset flag after a short delay to allow map clicks to work again
        setTimeout(() => {
          markerJustClicked = false
        }, 300)
      })

      markers.push(marker)
      bounds.extend({ lat: center.latitude, lng: center.longitude })
    })

    // Keep default camera position - don't auto-zoom to fit markers
    // This prevents the map from zooming in/out when data loads
    if (dashboardMap) {
      // Always maintain default position unless user manually interacts
      dashboardMap.setCenter({ lat: 7.8731, lng: 80.7718 })
      dashboardMap.setZoom(8)
    }
  } catch (error) {
    console.error('Error in initializeMap:', error)
    showMapError(mapContainer, `Map initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Add help request markers to the map
function addHelpRequestMarkersToMap(bounds?: any): void {
  if (!dashboardMap || typeof google === 'undefined' || !google.maps) return
  
  const tr = t()
  
  // Create bounds if not provided
  if (!bounds) {
    bounds = new google.maps.LatLngBounds()
  }
  
  // Filter to show only unverified requests on the map
  const unverifiedRequests = helpRequests.filter(request => {
    // Show only unverified requests (verified !== true)
    // This includes: verified === false, verified === undefined, verified === null
    return request.verified !== true
  })
  
  unverifiedRequests.forEach(request => {
    if (!request.latitude || !request.longitude) return
    
    // Determine marker color based on urgency level
    let markerColor = '#667eea' // Default blue
    if (request.urgencyLevel === 'critical') {
      markerColor = '#dc3545' // Red
    } else if (request.urgencyLevel === 'urgent') {
      markerColor = '#ff9800' // Orange
    } else if (request.urgencyLevel === 'moderate') {
      markerColor = '#ffc107' // Yellow
    }
    
    // Create custom marker icon (different shape - square/pin for help requests)
    const markerIcon = {
      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      scale: 8,
      fillColor: markerColor,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      rotation: 180 // Point downward
    }
    
    // Create marker
    const marker = new google.maps.Marker({
      position: { lat: request.latitude, lng: request.longitude },
      map: dashboardMap,
      icon: markerIcon,
      title: `${tr.requests.name || 'Name'}: ${request.name}`
    })
    
    // Format urgent needs
    const needsIcons: Record<string, string> = {
      shelter: '🏠',
      food: '🍽️',
      medical: '🏥',
      clothing: '👕',
      transportation: '🚗'
    }
    
    const urgentNeedsHtml = request.urgentNeeds.map(need => 
      `<span style="display: inline-block; margin: 2px; padding: 4px 8px; background: #fef3c7; border-radius: 4px; font-size: 0.85rem;">${needsIcons[need] || '📌'} ${need}</span>`
    ).join('')
    
    // Format urgency level badge
    const urgencyBadgeHtml = request.urgencyLevel ? `
      <div style="margin: 5px 0;">
        <span style="display: inline-block; padding: 4px 8px; background: ${markerColor === '#dc3545' ? '#fee2e2' : markerColor === '#ff9800' ? '#fed7aa' : '#fef3c7'}; color: ${markerColor === '#dc3545' ? '#991b1b' : markerColor === '#ff9800' ? '#9a3412' : '#92400e'}; border-radius: 4px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">
          ${request.urgencyLevel}
        </span>
      </div>
    ` : ''
    
    // Format verification image
    const imageHtml = request.verificationImage ? `
      <div style="margin: 10px 0; border-radius: 8px; overflow: hidden;">
        <img src="${request.verificationImage}" 
             alt="Verification Image" 
             style="width: 100%; max-height: 150px; object-fit: cover; display: block; cursor: pointer;"
             onclick="window.open('${request.verificationImage}', '_blank')"
             onerror="this.style.display='none'">
      </div>
    ` : ''
    
    // Format date
    const date = request.timestamp ? new Date(request.timestamp) : new Date()
    const dateStr = date.toLocaleString()
    
    // Verification status (check verified property, default to false if not set)
    const isVerified = request.verified === true
    const verificationStatusHtml = isVerified
      ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #10b981; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
          ✓ ${tr.requests.verified || 'Verified'}
        </span>`
      : `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #ef4444; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
          ✗ ${tr.requests.unverified || 'Unverified'}
        </span>`
    
    // Create info window content
    const infoWindowContent = `
      <div style="padding: 10px; min-width: 250px; max-width: 350px;">
        <div style="border-left: 4px solid ${markerColor}; padding-left: 10px; margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px 0; color: #1e293b; font-size: 1.1rem;">🚨 ${tr.requests.title || 'Help Request'}</h3>
          <p style="margin: 0; color: #64748b; font-size: 0.85rem;">${dateStr}</p>
        </div>
        <div style="margin-bottom: 8px;">${verificationStatusHtml}</div>
        <p style="margin: 5px 0; color: #475569;"><strong>${tr.requests.name || 'Name'}:</strong> ${request.name}</p>
        <p style="margin: 5px 0; color: #475569;"><strong>${tr.requests.phone || 'Phone'}:</strong> <a href="tel:${request.phone}" style="color: #667eea; text-decoration: none;">${request.phone}</a></p>
        <p style="margin: 5px 0; color: #475569;"><strong>${tr.requests.location || 'Location'}:</strong> ${request.location}</p>
        <p style="margin: 5px 0; color: #475569;"><strong>${tr.requests.people || 'People'}:</strong> ${request.numberOfPeople}</p>
        ${urgencyBadgeHtml}
        <div style="margin: 10px 0;">
          <strong style="color: #475569; display: block; margin-bottom: 5px;">${tr.requests.needs || 'Urgent Needs'}:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
            ${urgentNeedsHtml}
          </div>
        </div>
        ${request.additionalInfo ? `<p style="margin: 10px 0; padding: 8px; background: #f8fafc; border-radius: 4px; color: #64748b; font-size: 0.9rem;"><strong>${tr.requests.additionalInfo || 'Additional Info'}:</strong> ${request.additionalInfo}</p>` : ''}
        ${imageHtml}
        <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
          <a href="tel:${request.phone}" style="display: inline-block; padding: 8px 16px; background: ${markerColor}; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; flex: 1; text-align: center; min-width: 100px;">📞 ${tr.requests.call || 'Call'}</a>
          <a href="https://www.google.com/maps?q=${request.latitude},${request.longitude}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; flex: 1; text-align: center; min-width: 100px;">📍 ${tr.requests.shareLocation || 'Share Location'}</a>
          ${request.id ? `
            <button class="verify-request-btn" data-id="${request.id}" data-verified="${isVerified ? 'true' : 'false'}" data-request='${JSON.stringify(request).replace(/'/g, "&apos;")}' style="padding: 8px 16px; background: ${isVerified ? '#ef4444' : '#10b981'}; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; flex: 1; min-width: 100px;">
              ${isVerified ? '❌ ' + (tr.requests.unverify || 'Unverify') : '✓ ' + (tr.requests.verify || 'Verify')}
            </button>
          ` : ''}
        </div>
      </div>
    `
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    })
    
    // Listen for InfoWindow close event
    google.maps.event.addListener(infoWindow, 'closeclick', () => {
      if (currentInfoWindow === infoWindow) {
        currentInfoWindow = null
      }
    })
    
    // Add click listener to marker
    marker.addListener('click', () => {
      // Set flag to prevent map click from closing this InfoWindow
      markerJustClicked = true
      
      // Close previous InfoWindow if open
      if (currentInfoWindow) {
        currentInfoWindow.close()
      }
      // Open new InfoWindow and track it
      infoWindow.open(dashboardMap, marker)
      currentInfoWindow = infoWindow
      
      // Store infoWindow with marker for fullscreen map
      marker.set('infoWindow', infoWindow)
      
      // Add verify button handler after info window is opened
      if (request.id) {
        setTimeout(() => {
          const verifyBtn = document.querySelector(`.verify-request-btn[data-id="${request.id}"]`)
          if (verifyBtn) {
            verifyBtn.addEventListener('click', (e) => {
              e.preventDefault()
              e.stopPropagation()
              
              const requestId = (verifyBtn as HTMLElement).dataset.id
              const isVerified = (verifyBtn as HTMLElement).dataset.verified === 'true'
              const requestData = (verifyBtn as HTMLElement).dataset.request
              
              if (!requestId) return
              
              // Parse request data
              let requestObj: any = request // Use the request object from closure
              if (requestData) {
                try {
                  requestObj = JSON.parse(requestData.replace(/&apos;/g, "'"))
                } catch (e) {
                  console.error('Error parsing request data:', e)
                  requestObj = request // Fallback to original request
                }
              }
              
              // Close info window
              if (currentInfoWindow) {
                currentInfoWindow.close()
              }
              
              // Show verification modal (same as table) - works without authentication
              if (dashboardContainer) {
                showVerificationModal(requestId, requestObj, isVerified, dashboardContainer)
              }
            })
          }
        }, 100)
      }
      
      // Reset flag after a short delay to allow map clicks to work again
      setTimeout(() => {
        markerJustClicked = false
      }, 300)
    })
    
    markers.push(marker)
    helpRequestMarkers.push(marker) // Track help request markers separately
    bounds.extend({ lat: request.latitude, lng: request.longitude })
  })
}

// Load flood/landslide reports from API
async function loadFloodLandslideReports(_container: HTMLElement): Promise<void> {
  try {
    const response = await fetchFloodLandslideReports({ limit: 100, sort: 'timestamp', order: 'desc' })
    floodLandslideReports = response.data.filter(report => report.latitude && report.longitude)
    
    // Add markers to map if map is already initialized
    if (dashboardMap && typeof google !== 'undefined' && google.maps) {
      addFloodLandslideMarkersToMap()
    }
  } catch (error) {
    console.error('Error loading flood/landslide reports:', error)
    floodLandslideReports = []
  }
}

// Add flood/landslide markers to the map
function addFloodLandslideMarkersToMap(bounds?: any): void {
  if (!dashboardMap || typeof google === 'undefined' || !google.maps) return
  
  const tr = t()
  
  // Create bounds if not provided
  if (!bounds) {
    bounds = new google.maps.LatLngBounds()
  }
  
  floodLandslideReports.forEach(report => {
    if (!report.latitude || !report.longitude) return
    
    // Determine marker color based on type and severity
    let markerColor = '#667eea' // Default blue for flood
    if (report.type === 'landslide') {
      markerColor = '#8b4513' // Brown for landslide
    }
    
    // Adjust color based on severity
    if (report.severity === 'critical') {
      markerColor = '#dc3545' // Red
    } else if (report.severity === 'high') {
      markerColor = '#ff9800' // Orange
    } else if (report.severity === 'medium') {
      markerColor = '#ffc107' // Yellow
    } else if (report.severity === 'low') {
      markerColor = '#28a745' // Green
    }
    
    // Create custom marker icon (triangle for flood/landslide)
    const markerIcon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 10,
      fillColor: markerColor,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      rotation: 0
    }
    
    // Create marker
    const marker = new google.maps.Marker({
      position: { lat: report.latitude, lng: report.longitude },
      map: dashboardMap,
      icon: markerIcon,
      title: `${report.type === 'flood' ? tr.floodLandslide.flood : tr.floodLandslide.landslide}: ${report.location}`
    })
    
    // Format severity
    const severityLabels: Record<string, string> = {
      low: tr.floodLandslide.low,
      medium: tr.floodLandslide.medium,
      high: tr.floodLandslide.high,
      critical: tr.floodLandslide.critical
    }
    
    const severityBadge = `<span style="display: inline-block; padding: 4px 8px; background: ${markerColor}; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">${severityLabels[report.severity] || report.severity}</span>`
    
    const imageHtml = report.image ? `
      <div style="margin: 10px 0; border-radius: 8px; overflow: hidden;">
        <img src="${report.image}" 
             alt="${report.type}" 
             style="width: 100%; max-height: 200px; object-fit: cover; display: block; cursor: pointer;"
             onclick="window.open('${report.image}', '_blank')"
             onerror="this.style.display='none'">
      </div>
    ` : ''
    
    const infoWindowContent = `
      <div style="padding: 10px; min-width: 250px; max-width: 350px;">
        <div style="border-left: 4px solid ${markerColor}; padding-left: 10px; margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px 0; color: #1e293b; font-size: 1.1rem;">
            ${report.type === 'flood' ? '🌊 ' + tr.floodLandslide.flood : '⛰️ ' + tr.floodLandslide.landslide}
          </h3>
          <p style="margin: 0; color: #64748b; font-size: 0.9rem;">📍 ${report.location}</p>
        </div>
        ${severityBadge}
        ${report.description ? `<p style="margin: 10px 0; color: #475569; font-size: 0.9rem;">${report.description}</p>` : ''}
        ${report.reportedBy ? `<p style="margin: 5px 0; color: #64748b; font-size: 0.85rem;"><strong>${tr.floodLandslide.reportedBy}:</strong> ${report.reportedBy}</p>` : ''}
        ${report.phone ? `<p style="margin: 5px 0; color: #64748b; font-size: 0.85rem;"><strong>${tr.floodLandslide.phone}:</strong> <a href="tel:${report.phone}" style="color: #667eea;">${report.phone}</a></p>` : ''}
        ${imageHtml}
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
          <a href="https://www.google.com/maps?q=${report.latitude},${report.longitude}" target="_blank" style="display: inline-block; padding: 8px 16px; background: ${markerColor}; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; text-align: center;">
            🗺️ ${tr.floodLandslide.viewOnMap}
          </a>
        </div>
      </div>
    `
    
    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    })
    
    // Add click listener to marker
    marker.addListener('click', () => {
      if (currentInfoWindow) {
        currentInfoWindow.close()
      }
      infoWindow.open(dashboardMap, marker)
      currentInfoWindow = infoWindow
    })
    
    // Store infoWindow with marker for fullscreen map
    marker.set('infoWindow', infoWindow)
    
    markers.push(marker)
    floodLandslideMarkers.push(marker) // Track flood/landslide markers separately
    bounds.extend({ lat: report.latitude, lng: report.longitude })
  })
}

// Display Flood/Landslide Reports Table
function displayFloodLandslideReports(container: HTMLElement): void {
  const tableBody = container.querySelector<HTMLTableSectionElement>('#flood-landslide-table-body')
  if (!tableBody) return

  const tr = t()

  if (floodLandslideReports.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #666;" data-i18n="floodLandslide.noReports">${tr.floodLandslide.noReports}</td></tr>`
    return
  }

  const sorted = [...floodLandslideReports].sort((a: any, b: any) => {
    const dateA = new Date(a.timestamp || a.createdAt || 0).getTime()
    const dateB = new Date(b.timestamp || b.createdAt || 0).getTime()
    return dateB - dateA
  })

  tableBody.innerHTML = sorted.map((report: any, i: number) => {
    const date = new Date(report.timestamp || report.createdAt || Date.now())
    const typeLabel = report.type === 'flood' ? tr.floodLandslide.flood : tr.floodLandslide.landslide
    const typeIcon = report.type === 'flood' ? '🌊' : '⛰️'
    
    const severityLabels: Record<string, string> = {
      low: tr.floodLandslide.low,
      medium: tr.floodLandslide.medium,
      high: tr.floodLandslide.high,
      critical: tr.floodLandslide.critical
    }
    
    const severityColors: Record<string, string> = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#ff9800',
      critical: '#dc3545'
    }
    
    const severityBadge = `<span style="display: inline-block; padding: 4px 8px; background: ${severityColors[report.severity] || '#667eea'}; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">${severityLabels[report.severity] || report.severity}</span>`

    const locationCell = report.latitude && report.longitude
      ? `<div style="max-width: 250px;">
          <div style="margin-bottom: 4px; color: #475569; font-weight: 500;">📍 ${report.location || 'Location not specified'}</div>
          <a href="https://www.google.com/maps?q=${report.latitude},${report.longitude}" target="_blank" style="color: #667eea; text-decoration: none; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px;">
            🗺️ ${tr.floodLandslide.viewOnMap}
          </a>
        </div>`
      : `<div style="max-width: 250px;">
          <div style="color: #475569;">📍 ${report.location || 'Location not specified'}</div>
        </div>`

    return `
      <tr>
        <td>${i + 1}</td>
        <td><span style="font-size: 1.2rem;">${typeIcon}</span> ${typeLabel}</td>
        <td>${locationCell}</td>
        <td>${severityBadge}</td>
        <td style="max-width: 300px;">${report.description || '-'}</td>
        <td>${report.reportedBy || '-'}</td>
        <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
        <td>
          ${report.latitude && report.longitude ? `
            <button class="btn-action" data-lat="${report.latitude}" data-lng="${report.longitude}" title="${tr.floodLandslide.viewOnMap || 'View on Map'}">🗺️</button>
          ` : ''}
          ${report.id ? `
            <button class="btn-action edit-btn" data-id="${report.id}" data-report='${JSON.stringify(report).replace(/'/g, "&#39;")}' title="${tr.floodLandslide.edit || 'Edit Report'}">✏️</button>
            <button class="btn-action delete-btn" data-id="${report.id}" title="${tr.floodLandslide.delete || 'Delete Report'}">🗑️</button>
          ` : ''}
        </td>
      </tr>
    `
  }).join('')

  // Add click handlers for map buttons
  tableBody.querySelectorAll('.btn-action[data-lat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat((btn as HTMLElement).dataset.lat || '0')
      const lng = parseFloat((btn as HTMLElement).dataset.lng || '0')
      if (dashboardMap) {
        dashboardMap.setCenter({ lat, lng })
        dashboardMap.setZoom(15)
        const overviewNav = document.querySelector('.nav-item[data-view="overview"]')
        if (overviewNav) (overviewNav as HTMLElement).click()

        const marker = markers.find(m => {
          const pos = m.getPosition()
          return Math.abs(pos.lat() - lat) < 0.001 && Math.abs(pos.lng() - lng) < 0.001
        })
        if (marker) {
          google.maps.event.trigger(marker, 'click')
        }
      }
    })
  })

  // Add click handlers for edit buttons
  tableBody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      const reportData = (btn as HTMLElement).dataset.report
      if (!reportData) return

      try {
        const report: FloodLandslideReport = JSON.parse(reportData.replace(/&#39;/g, "'"))
        showEditFloodLandslideModal(report, container)
      } catch (error) {
        console.error('Error parsing report data:', error)
        alert('Failed to load report for editing.')
      }
    })
  })

  // Add click handlers for delete buttons
  tableBody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      const reportId = (btn as HTMLElement).dataset.id
      if (!reportId) return

      if (confirm(tr.floodLandslide.delete + '?')) {
        try {
          await deleteFloodLandslideReport(reportId)
          // Reload reports
          await loadFloodLandslideReports(container)
          displayFloodLandslideReports(container)
        } catch (error) {
          console.error('Error deleting report:', error)
          alert('Failed to delete report. Please try again.')
        }
      }
    })
  })
}

// Show edit modal for flood/landslide report
function showEditFloodLandslideModal(report: FloodLandslideReport, container: HTMLElement): void {
  const tr = t()
  
  const modal = document.createElement('div')
  modal.className = 'modal-overlay'
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      <h2>${tr.floodLandslide.edit || 'Edit Report'}</h2>
      
      <form id="edit-flood-landslide-form">
        <div class="form-group">
          <label>${tr.floodLandslide.type} *</label>
          <select id="edit-type" name="type" required>
            <option value="flood" ${report.type === 'flood' ? 'selected' : ''}>${tr.floodLandslide.flood}</option>
            <option value="landslide" ${report.type === 'landslide' ? 'selected' : ''}>${tr.floodLandslide.landslide}</option>
          </select>
        </div>

        <div class="form-group">
          <label>${tr.floodLandslide.severity} *</label>
          <select id="edit-severity" name="severity" required>
            <option value="low" ${report.severity === 'low' ? 'selected' : ''}>${tr.floodLandslide.low}</option>
            <option value="medium" ${report.severity === 'medium' ? 'selected' : ''}>${tr.floodLandslide.medium}</option>
            <option value="high" ${report.severity === 'high' ? 'selected' : ''}>${tr.floodLandslide.high}</option>
            <option value="critical" ${report.severity === 'critical' ? 'selected' : ''}>${tr.floodLandslide.critical}</option>
          </select>
        </div>

        <div class="form-group">
          <label>${tr.floodLandslide.location} *</label>
          <input type="text" id="edit-location" name="location" value="${report.location || ''}" required>
        </div>

        <div class="form-group">
          <label>${tr.floodLandslide.description}</label>
          <textarea id="edit-description" name="description" rows="4">${report.description || ''}</textarea>
        </div>

        <div class="form-group">
          <label>${tr.floodLandslide.reportedBy}</label>
          <input type="text" id="edit-reportedBy" name="reportedBy" value="${report.reportedBy || ''}">
        </div>

        <div class="form-group">
          <label>${tr.floodLandslide.phone}</label>
          <input type="tel" id="edit-phone" name="phone" value="${report.phone || ''}">
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="submit" class="submit-btn" style="flex: 1;">${tr.floodLandslide.update || 'Update Report'}</button>
          <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()" style="flex: 1;">${tr.floodLandslide.cancel || 'Cancel'}</button>
        </div>
      </form>
    </div>
  `

  document.body.appendChild(modal)

  // Handle form submission
  const form = modal.querySelector<HTMLFormElement>('#edit-flood-landslide-form')
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      if (!report.id) {
        alert('Report ID is missing. Cannot update.')
        return
      }

      const formData = new FormData(form)
      const updateData: Partial<FloodLandslideReport> = {
        type: formData.get('type') as 'flood' | 'landslide',
        severity: formData.get('severity') as 'low' | 'medium' | 'high' | 'critical',
        location: formData.get('location') as string,
        description: formData.get('description') as string || undefined,
        reportedBy: formData.get('reportedBy') as string || undefined,
        phone: formData.get('phone') as string || undefined,
      }

      try {
        await updateFloodLandslideReport(report.id, updateData)
        modal.remove()
        // Reload reports
        await loadFloodLandslideReports(container)
        displayFloodLandslideReports(container)
        alert(tr.floodLandslide.updateSuccess || 'Report updated successfully!')
      } catch (error) {
        console.error('Error updating report:', error)
        alert(tr.floodLandslide.updateError || 'Failed to update report. Please try again.')
      }
    })
  }

  // Close modal on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove()
    }
  })
}

// Display Centers Table
function displayCentersTable(): void {
  const tableBody = document.querySelector<HTMLTableSectionElement>('#centers-table-body')
  if (!tableBody) return

  const tr = t()

  tableBody.innerHTML = disasterCenters.map(center => {
    const imageCell = center.image ? `
      <div class="center-image-wrapper">
        <img src="${center.image}" 
             alt="${center.name}" 
             class="center-image-thumbnail"
             onclick="openCenterImageModal('${center.image}', '${center.name}')"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'no-image\\'>📷</div>'">
        <div class="image-hover-overlay">
          <span>👁️ View</span>
        </div>
      </div>
    ` : '<div class="no-image">📷</div>'
    
    const additionalInfoCell = center.additionalInfo 
      ? `<td><div class="additional-info-cell" title="${center.additionalInfo}">${center.additionalInfo.length > 50 ? center.additionalInfo.substring(0, 50) + '...' : center.additionalInfo}</div></td>`
      : '<td><span style="color: #94a3b8;">-</span></td>'
    
    return `
    <tr>
      <td>
        <div class="center-name-cell">
          <div class="center-image-cell">${imageCell}</div>
          <div class="center-name-content">
            <strong>${center.name}</strong>
          </div>
        </div>
      </td>
      <td>${center.address}</td>
      <td><a href="tel:${center.phone}">${center.phone}</a></td>
      <td>${center.capacity}</td>
      <td><span class="status-badge status-${center.status}">${tr.status[center.status]}</span></td>
      <td>${center.services.join(', ')}</td>
      ${additionalInfoCell}
      <td>
        <button class="btn-action" data-lat="${center.latitude}" data-lng="${center.longitude}" title="${tr.centers.viewOnMap}">🗺️</button>
        <a href="tel:${center.phone}" class="btn-action" title="${tr.centers.call}">📞</a>
      </td>
    </tr>
  `
  }).join('')
  
  // Add center image modal
  addCenterImageModal()

  tableBody.querySelectorAll('.btn-action[data-lat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat((btn as HTMLElement).dataset.lat || '0')
      const lng = parseFloat((btn as HTMLElement).dataset.lng || '0')
      if (dashboardMap) {
        dashboardMap.setCenter({ lat, lng })
        dashboardMap.setZoom(15)
        const overviewNav = document.querySelector('.nav-item[data-view="overview"]')
        if (overviewNav) (overviewNav as HTMLElement).click()
        
        // Open info window for the marker at this location
        const marker = markers.find(m => {
          const pos = m.getPosition()
          return Math.abs(pos.lat() - lat) < 0.001 && Math.abs(pos.lng() - lng) < 0.001
        })
        if (marker) {
          // Trigger click on marker to open info window
          google.maps.event.trigger(marker, 'click')
        }
      }
    })
  })
}

// Filter Centers Table
function filterCentersTable(searchTerm: string): void {
  const tableBody = document.querySelector<HTMLTableSectionElement>('#centers-table-body')
  if (!tableBody) return
  const rows = tableBody.querySelectorAll('tr')
  rows.forEach(row => {
    const text = row.textContent?.toLowerCase() || ''
    row.style.display = text.includes(searchTerm) ? '' : 'none'
  })
}

// Display Help Requests
function displayHelpRequests(container: HTMLElement, requests: any[] = []): void {
  const tableBody = container.querySelector<HTMLTableSectionElement>('#requests-table-body')
  const mobileGrid = container.querySelector<HTMLDivElement>('#requests-mobile-grid')
  
  if (!tableBody || !mobileGrid) return

  const tr = t()

  if (requests.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: #666;" data-i18n="requests.noRequests">${tr.requests.noRequests}</td></tr>`
    mobileGrid.innerHTML = `<div style="text-align: center; padding: 2rem; color: #666;" data-i18n="requests.noRequests">${tr.requests.noRequests}</div>`
    return
  }

  // Sort by timestamp (newest first) - requests should already be sorted from API
  const sorted = [...requests].sort((a: any, b: any) => {
    const dateA = new Date(a.timestamp || a.createdAt || 0).getTime()
    const dateB = new Date(b.timestamp || b.createdAt || 0).getTime()
    return dateB - dateA
  })

  tableBody.innerHTML = sorted.map((req: any, i: number) => {
    const date = new Date(req.timestamp || req.createdAt || Date.now())
    const needsIcons: Record<string, string> = {
      shelter: '🏠',
      food: '🍽️',
      medical: '🏥',
      clothing: '👕',
      transportation: '🚗'
    }
    
    // Format urgent needs
    const urgentNeedsHtml = req.urgentNeeds.map((need: string) => 
      `<span class="need-tag" title="${need}" style="display: inline-block; margin: 2px; padding: 4px 8px; background: #fef3c7; border-radius: 4px; font-size: 0.85rem;">${needsIcons[need] || '📌'} ${need}</span>`
    ).join(' ')
    
    // Format urgency level badge
    const urgencyLevel = req.urgencyLevel || 'moderate'
    const urgencyColors: Record<string, string> = {
      critical: '#dc3545',
      urgent: '#ff9800',
      moderate: '#ffc107'
    }
    const urgencyBadge = `<span class="urgency-badge urgency-${urgencyLevel}" style="display: inline-block; padding: 4px 8px; background: ${urgencyColors[urgencyLevel] || '#ffc107'}; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">${urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)}</span>`
    
    // Format location/address with map link
    const locationCell = req.latitude && req.longitude 
      ? `<div style="max-width: 250px;">
          <div style="margin-bottom: 4px; color: #475569; font-weight: 500;">📍 ${req.location || 'Location not specified'}</div>
          <a href="https://www.google.com/maps?q=${req.latitude},${req.longitude}" target="_blank" style="color: #667eea; text-decoration: none; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px;">
                  🗺️ View on Map
                </a>
        </div>`
      : `<div style="max-width: 250px;">
          <div style="color: #475569;">📍 ${req.location || 'Location not specified'}</div>
        </div>`
    
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${req.name}</td>
        <td><a href="tel:${req.phone}" style="color: #667eea; text-decoration: none;">${req.phone}</a></td>
        <td>${locationCell}</td>
        <td>${req.numberOfPeople}</td>
        <td><div style="display: flex; flex-wrap: wrap; gap: 4px;">${urgentNeedsHtml}</div></td>
        <td>${urgencyBadge}</td>
        <td>${date.toLocaleString()}</td>
        <td>
          ${req.verified 
            ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #10b981; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
                ✓ ${tr.requests.verified || 'Verified'}
              </span>`
            : `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: #ef4444; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
                ✗ ${tr.requests.unverified || 'Unverified'}
              </span>`
          }
        </td>
        <td>
          <a href="tel:${req.phone}" class="btn-action" title="${tr.requests.call}">📞</a>
          ${req.latitude && req.longitude ? `
            <button class="btn-action" data-lat="${req.latitude}" data-lng="${req.longitude}" title="View on Map">🗺️</button>
              ` : ''}
          ${req.id ? `
            <button class="btn-action verify-btn" data-id="${req.id}" data-verified="${req.verified ? 'true' : 'false'}" data-request='${JSON.stringify(req).replace(/'/g, "&apos;")}' title="${req.verified ? (tr.requests.unverify || 'Unverify') : (tr.requests.verify || 'Verify')}">
              ${req.verified ? '❌' : '✓'}
            </button>
          ` : ''}
        </td>
      </tr>
    `
  }).join('')
  
  // Render mobile card grid
  mobileGrid.innerHTML = sorted.map((req: any, i: number) => {
    const date = new Date(req.timestamp || req.createdAt || Date.now())
    const needsIcons: Record<string, string> = {
      shelter: '🏠',
      food: '🍽️',
      medical: '🏥',
      clothing: '👕',
      transportation: '🚗'
    }
    
    const urgentNeedsHtml = req.urgentNeeds.map((need: string) => 
      `<span class="need-tag-mobile" style="display: inline-block; margin: 2px; padding: 4px 8px; background: #fef3c7; border-radius: 4px; font-size: 0.75rem;">${needsIcons[need] || '📌'} ${need}</span>`
    ).join('')
    
    const urgencyLevel = req.urgencyLevel || 'moderate'
    const urgencyColors: Record<string, string> = {
      critical: '#dc3545',
      urgent: '#ff9800',
      moderate: '#ffc107'
    }
    const urgencyBadge = `<span style="display: inline-block; padding: 3px 6px; background: ${urgencyColors[urgencyLevel] || '#ffc107'}; color: white; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase;">${urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)}</span>`
    
    const verifiedBadge = req.verified 
      ? `<span style="display: inline-flex; align-items: center; gap: 3px; padding: 3px 6px; background: #10b981; color: white; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">✓ ${tr.requests.verified || 'Verified'}</span>`
      : `<span style="display: inline-flex; align-items: center; gap: 3px; padding: 3px 6px; background: #ef4444; color: white; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">✗ ${tr.requests.unverified || 'Unverified'}</span>`
    
    return `
      <div class="request-card-mobile" data-request-id="${req.id || ''}">
        <div class="request-card-header-mobile">
          <div class="request-card-title">
            <span class="request-number-mobile">#${i + 1}</span>
            <span class="request-name-mobile">${req.name}</span>
          </div>
          <div class="request-badges-mobile">
            ${urgencyBadge}
            ${verifiedBadge}
          </div>
        </div>
        <div class="request-card-content-mobile">
          <div class="request-info-row">
            <span class="info-label">📞</span>
            <a href="tel:${req.phone}" class="info-value-link">${req.phone}</a>
          </div>
          <div class="request-info-row">
            <span class="info-label">📍</span>
            <span class="info-value">${req.location || 'Location not specified'}</span>
            ${req.latitude && req.longitude ? `<a href="https://www.google.com/maps?q=${req.latitude},${req.longitude}" target="_blank" class="map-link-mobile">🗺️ View Map</a>` : ''}
          </div>
          <div class="request-info-row">
            <span class="info-label">👥</span>
            <span class="info-value">${req.numberOfPeople} ${tr.requests.people || 'people'}</span>
          </div>
          ${req.urgentNeeds && req.urgentNeeds.length > 0 ? `
          <div class="request-info-row">
            <span class="info-label">📋</span>
            <div class="info-value needs-mobile">${urgentNeedsHtml}</div>
          </div>
          ` : ''}
          <div class="request-info-row">
            <span class="info-label">📅</span>
            <span class="info-value">${date.toLocaleString()}</span>
          </div>
        </div>
        <div class="request-card-actions-mobile">
          <a href="tel:${req.phone}" class="action-btn-mobile action-btn-call">📞 ${tr.requests.call || 'Call'}</a>
          ${req.latitude && req.longitude ? `<button class="action-btn-mobile action-btn-map" data-lat="${req.latitude}" data-lng="${req.longitude}">🗺️ Map</button>` : ''}
          ${req.id ? `<button class="action-btn-mobile action-btn-verify verify-btn-mobile" data-id="${req.id}" data-verified="${req.verified ? 'true' : 'false'}" data-request='${JSON.stringify(req).replace(/'/g, "&apos;")}">${req.verified ? '❌ ' + (tr.requests.unverify || 'Unverify') : '✓ ' + (tr.requests.verify || 'Verify')}</button>` : ''}
        </div>
      </div>
    `
  }).join('')
  
  // Add click handlers for map buttons
  tableBody.querySelectorAll('.btn-action[data-lat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat((btn as HTMLElement).dataset.lat || '0')
      const lng = parseFloat((btn as HTMLElement).dataset.lng || '0')
      if (dashboardMap) {
        dashboardMap.setCenter({ lat, lng })
        dashboardMap.setZoom(15)
        const overviewNav = document.querySelector('.nav-item[data-view="overview"]')
        if (overviewNav) (overviewNav as HTMLElement).click()
        
        // Find and trigger click on the help request marker at this location
        const marker = markers.find(m => {
          const pos = m.getPosition()
          return Math.abs(pos.lat() - lat) < 0.001 && Math.abs(pos.lng() - lng) < 0.001
        })
        if (marker) {
          google.maps.event.trigger(marker, 'click')
        }
      }
    })
  })
  
  // Add click handlers for verify/unverify buttons
  tableBody.querySelectorAll('.verify-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      const requestId = (btn as HTMLElement).dataset.id
      const isVerified = (btn as HTMLElement).dataset.verified === 'true'
      const requestData = (btn as HTMLElement).dataset.request
      
      console.log('Verify button clicked', { requestId, isVerified, requestData })
      
      if (!requestId) {
        console.error('No request ID found')
        return
      }
      
      // Parse request data
      let request: any = null
      if (requestData) {
        try {
          request = JSON.parse(requestData.replace(/&apos;/g, "'"))
        } catch (e) {
          console.error('Error parsing request data:', e)
        }
      }
      
      // Show verification modal/form (works without authentication)
      showVerificationModal(requestId, request, isVerified, container)
    })
  })
  
  // Add click handlers for map buttons (mobile cards)
  mobileGrid.querySelectorAll('.action-btn-map').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat((btn as HTMLElement).dataset.lat || '0')
      const lng = parseFloat((btn as HTMLElement).dataset.lng || '0')
      if (dashboardMap) {
        dashboardMap.setCenter({ lat, lng })
        dashboardMap.setZoom(15)
        const overviewNav = document.querySelector('.nav-item[data-view="overview"]')
        if (overviewNav) (overviewNav as HTMLElement).click()
        
        // Find and trigger click on the help request marker at this location
        const marker = markers.find(m => {
          const pos = m.getPosition()
          return Math.abs(pos.lat() - lat) < 0.001 && Math.abs(pos.lng() - lng) < 0.001
        })
        if (marker) {
          google.maps.event.trigger(marker, 'click')
        }
      }
    })
  })
  
  // Add click handlers for verify/unverify buttons (mobile cards)
  mobileGrid.querySelectorAll('.verify-btn-mobile').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      const requestId = (btn as HTMLElement).dataset.id
      const isVerified = (btn as HTMLElement).dataset.verified === 'true'
      const requestData = (btn as HTMLElement).dataset.request
      
      console.log('Verify button clicked (mobile)', { requestId, isVerified, requestData })
      
      if (!requestId) {
        console.error('No request ID found')
        return
      }
      
      // Parse request data
      let request: any = null
      if (requestData) {
        try {
          request = JSON.parse(requestData.replace(/&apos;/g, "'"))
        } catch (e) {
          console.error('Error parsing request data:', e)
        }
      }
      
      // Show verification modal/form (works without authentication)
      showVerificationModal(requestId, request, isVerified, container)
    })
  })
}

// Show verification modal/form - works without authentication
function showVerificationModal(
  requestId: string,
  request: any,
  isVerified: boolean,
  container: HTMLElement
): void {
  const tr = t()
  
  // Remove existing modal if any
  const existingModal = document.getElementById('verification-modal')
  if (existingModal) existingModal.remove()
  
  // Create modal
  const modal = document.createElement('div')
  modal.id = 'verification-modal'
  modal.className = 'image-modal active' // Add 'active' class to show modal immediately
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeVerificationModal()"></div>
    <div class="modal-content verification-modal-content" style="max-width: 95vw; width: 95vw; max-height: 90vh; overflow-y: auto; padding: 2rem;">
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0;">
        <h2 style="margin: 0; color: #1e293b; font-size: 1.5rem;">${isVerified ? (tr.requests.unverify || 'Unverify Request') : (tr.requests.verifyRequest || 'Verify Request')}</h2>
        <button class="modal-close" onclick="closeVerificationModal()">✕</button>
            </div>
      
      <div class="modal-body">
        ${request ? `
          <div class="verification-request-details" style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <h3 style="margin: 0 0 1rem 0; color: #1e293b; font-size: 1.2rem;">${tr.requests.requestDetails || 'Request Details'}</h3>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">${tr.requests.name || 'Name'}:</strong>
              <span style="color: #1e293b;">${request.name || 'N/A'}</span>
          </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">${tr.requests.phone || 'Phone'}:</strong>
              <span style="color: #1e293b;"><a href="tel:${request.phone}" style="color: #667eea; text-decoration: none;">${request.phone || 'N/A'}</a></span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">${tr.requests.location || 'Location'}:</strong>
              <span style="color: #1e293b;">${request.location || 'N/A'}</span>
          </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">${tr.requests.people || 'People'}:</strong>
              <span style="color: #1e293b;">${request.numberOfPeople || 'N/A'}</span>
              </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0;">
              <strong style="color: #475569;">Urgency:</strong>
              <span style="color: #1e293b;">${request.urgencyLevel ? request.urgencyLevel.charAt(0).toUpperCase() + request.urgencyLevel.slice(1) : 'N/A'}</span>
            </div>
            ${request.urgentNeeds && request.urgentNeeds.length > 0 ? `
              <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0;">
                <strong style="color: #475569;">${tr.requests.needs || 'Needs'}:</strong>
                <span style="color: #1e293b;">${request.urgentNeeds.join(', ')}</span>
          </div>
            ` : ''}
            ${request.additionalInfo ? `
              <div class="detail-row" style="padding: 0.75rem 0;">
                <strong style="color: #475569; display: block; margin-bottom: 0.5rem;">${tr.requests.additionalInfo || 'Additional Info'}:</strong>
                <span style="color: #1e293b;">${request.additionalInfo}</span>
            </div>
          ` : ''}
            ${request.verificationImage ? `
              <div class="detail-row" style="padding: 0.75rem 0; margin-top: 1rem;">
                <strong style="color: #475569; display: block; margin-bottom: 0.5rem;">Verification Image:</strong>
                <div class="verification-image-preview">
                  <img src="${request.verificationImage}" alt="Verification" onclick="window.open('${request.verificationImage}', '_blank')" style="max-width: 200px; max-height: 200px; cursor: pointer; border-radius: 4px; border: 2px solid #e2e8f0;">
              </div>
            </div>
          ` : ''}
                  </div>
        ` : ''}
        
        <div class="verification-form-group" style="margin-bottom: 1.5rem;">
          <label for="verification-notes" style="display: block; margin-bottom: 0.5rem; color: #475569; font-weight: 600;">${tr.requests.verificationNotes || 'Verification Notes'} <span style="color: #94a3b8;">(${tr.requests.cancel || 'Optional'})</span></label>
          <textarea id="verification-notes" rows="4" placeholder="${tr.requests.verificationNotesPlaceholder || 'Add any notes about this verification (optional)'}" style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-family: inherit; font-size: 0.95rem; resize: vertical;"></textarea>
                </div>
        
              </div>
      
      <div class="modal-footer" style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1.5rem; border-top: 2px solid #e2e8f0;">
        <button class="btn-secondary" onclick="closeVerificationModal()" style="padding: 0.75rem 1.5rem; background: #f1f5f9; color: #475569; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">${tr.requests.cancel || 'Cancel'}</button>
        <button class="btn-primary verify-confirm-btn" data-id="${requestId}" data-verified="${isVerified}" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
          ${isVerified ? (tr.requests.unverify || 'Unverify') : (tr.requests.verify || 'Verify')}
        </button>
        </div>
      </div>
    `
  
  document.body.appendChild(modal)
  document.body.style.overflow = 'hidden'
  
  // Hide sidebar when modal is open
  const sidebar = document.querySelector('.sidebar')
  const sidebarNav = container.querySelector('#sidebar-nav')
  if (sidebar) (sidebar as HTMLElement).style.display = 'none'
  if (sidebarNav) (sidebarNav as HTMLElement).style.display = 'none'
  
  // Also hide the main content area background
  const dashboard = container.querySelector('.dashboard')
  if (dashboard) (dashboard as HTMLElement).style.opacity = '0.3'
  
  // Modal already has 'active' class, so it should be visible immediately
  console.log('Verification modal created and shown', { modal, hasActive: modal.classList.contains('active') })
  
  // Add close function to window
  ;(window as any).closeVerificationModal = () => {
    const modal = document.getElementById('verification-modal')
    if (modal) {
      modal.classList.remove('active')
      document.body.style.overflow = ''
      
      // Show sidebar again when modal closes
      const sidebar = document.querySelector('.sidebar')
      const sidebarNav = container.querySelector('#sidebar-nav')
      if (sidebar) (sidebar as HTMLElement).style.display = ''
      if (sidebarNav) (sidebarNav as HTMLElement).style.display = ''
      
      // Restore main content opacity
      const dashboard = container.querySelector('.dashboard')
      if (dashboard) (dashboard as HTMLElement).style.opacity = ''
      
      setTimeout(() => {
        modal.remove()
      }, 300) // Wait for animation
    }
  }
  
  // Handle verification confirmation
  const confirmBtn = modal.querySelector('.verify-confirm-btn')
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      const requestId = (confirmBtn as HTMLElement).dataset.id
      const isVerified = (confirmBtn as HTMLElement).dataset.verified === 'true'
      
      if (!requestId) return
      
      // Disable button
      ;(confirmBtn as HTMLButtonElement).disabled = true
      ;(confirmBtn as HTMLElement).innerHTML = '⏳ Processing...'
      
      try {
        // Verify/unverify request (works without authentication)
        await verifyHelpRequest(requestId, !isVerified)
        
        // Close modal
        ;(window as any).closeVerificationModal()
        
        // Reload help requests and map markers
        await loadHelpRequests(container)
        
        // Also reload dashboard data to ensure everything is in sync
        if (dashboardContainer) {
          await loadDashboardData(dashboardContainer)
        }
        
        // Show success message
        const message = !isVerified 
          ? (tr.requests.verified || 'Request verified successfully')
          : (tr.requests.unverified || 'Request unverified successfully')
        console.log(message)
      } catch (error: any) {
        console.error('Error verifying request:', error)
        
        // Show user-friendly error message based on error type
        let errorMessage = 'Failed to update verification status. Please try again.'
        
        if (error.status === 500) {
          errorMessage = 'Server error: The backend encountered an error. Please check backend logs or contact support.'
        } else if (error.status === 404) {
          errorMessage = 'Request not found. It may have been deleted.'
        } else if (error.status === 400) {
          errorMessage = error.message || 'Invalid request. Please check the data and try again.'
        } else if (error.message) {
          errorMessage = error.message
        } else if (error.data && error.data.message) {
          errorMessage = error.data.message
        }
        
        alert(errorMessage)
        ;(confirmBtn as HTMLButtonElement).disabled = false
        ;(confirmBtn as HTMLElement).innerHTML = isVerified ? (tr.requests.unverify || 'Unverify') : (tr.requests.verify || 'Verify')
      }
    })
  }
}

// Add center image modal
function addCenterImageModal(): void {
  // Remove existing modal if any
  const existingModal = document.getElementById('center-image-modal')
  if (existingModal) existingModal.remove()
  
  const modal = document.createElement('div')
  modal.id = 'center-image-modal'
  modal.className = 'image-modal'
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeCenterImageModal()"></div>
    <div class="modal-content">
      <button class="modal-close" onclick="closeCenterImageModal()">✕</button>
      <img id="center-modal-image" src="" alt="Disaster Center Image">
      <p class="modal-caption" id="center-modal-caption">Disaster Center</p>
    </div>
  `
  document.body.appendChild(modal)
  
  // Add global functions for modal
  ;(window as any).openCenterImageModal = (imageSrc: string, centerName: string) => {
    const modal = document.getElementById('center-image-modal')
    const modalImage = document.getElementById('center-modal-image') as HTMLImageElement
    const modalCaption = document.getElementById('center-modal-caption')
    if (modal && modalImage && modalCaption) {
      modalImage.setAttribute('src', imageSrc)
      modalCaption.textContent = centerName
      modal.classList.add('active')
      document.body.style.overflow = 'hidden'
    }
  }
  
  ;(window as any).closeCenterImageModal = () => {
    const modal = document.getElementById('center-image-modal')
    if (modal) {
      modal.classList.remove('active')
      document.body.style.overflow = ''
    }
  }
}


