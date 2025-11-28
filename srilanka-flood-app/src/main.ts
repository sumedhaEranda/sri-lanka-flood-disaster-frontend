import './style.css'
import { createDashboardHTML, setupDashboard } from './disaster-centers.ts'
import { createHomelessHelpForm, setupHomelessHelpForm } from './homeless-help.ts'
import { createCenterFormHTML, setupCreateCenterForm } from './create-center.ts'
import { getCurrentLanguage, setLanguage } from './i18n.ts'

// Initialize default language to Sinhala if not set
if (!localStorage.getItem('language')) {
  setLanguage('si')
}

// Update HTML lang attribute based on current language
const currentLang = getCurrentLanguage()
document.documentElement.lang = currentLang

// Listen for language changes and update HTML lang attribute
window.addEventListener('languagechange', ((e: CustomEvent<{ language: string }>) => {
  document.documentElement.lang = e.detail.language
}) as EventListener)

// Request location permission when page loads
if (navigator.geolocation) {
  // Request location permission immediately when page loads
  // This allows the browser to prompt for permission early
  navigator.geolocation.getCurrentPosition(
    () => {
      // Permission granted - location will be used when form is opened
      console.log('Location permission granted')
    },
    (error) => {
      // Permission denied or error - user can still manually set location
      console.log('Location permission:', error.code === 1 ? 'denied' : 'unavailable')
    },
    {
      enableHighAccuracy: false, // Use less accurate but faster method for permission request
      timeout: 5000,
      maximumAge: 0
    }
  )
}

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  console.error('App element not found!')
} else {
  async function showDashboard() {
    if (!app) return
    app.innerHTML = createDashboardHTML()
    await setupDashboard(app, showHelpForm, showCreateCenter)
  }

  function showHelpForm() {
    if (!app) return
    app.innerHTML = createHomelessHelpForm()
    setupHomelessHelpForm(app)
    const formContainer = app.querySelector('.form-container')
    if (formContainer) {
      const dashboardBtn = document.createElement('button')
      dashboardBtn.className = 'primary-btn back-btn'
      dashboardBtn.innerHTML = '<span>←</span> <span>Back to Dashboard</span>'
      dashboardBtn.addEventListener('click', showDashboard)
      formContainer.insertBefore(dashboardBtn, formContainer.firstChild)
    }
  }

  function showCreateCenter() {
    if (!app) return
    app.innerHTML = createCenterFormHTML()
    setupCreateCenterForm(app, showDashboard)
    const formContainer = app.querySelector('.form-container')
    if (formContainer) {
      const dashboardBtn = document.createElement('button')
      dashboardBtn.className = 'primary-btn back-btn'
      dashboardBtn.innerHTML = '<span>←</span> <span>Back to Dashboard</span>'
      dashboardBtn.addEventListener('click', showDashboard)
      formContainer.insertBefore(dashboardBtn, formContainer.firstChild)
    }
  }

  showDashboard()
}

