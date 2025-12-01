import './styles/style.css'
import { createDashboardHTML, setupDashboard } from './pages/Dashboard.ts'
import { createHomelessHelpForm, setupHomelessHelpForm } from './components/HelpRequestForm.ts'
import { createCenterFormHTML, setupCreateCenterForm } from './components/CreateCenterForm.ts'
import { createFloodLandslideFormHTML, setupFloodLandslideForm } from './components/FloodLandslideForm.ts'
import { getCurrentLanguage, setLanguage } from './utils/i18n.ts'

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
  // Reload current view with new language
  const app = document.querySelector<HTMLDivElement>('#app')
  if (app) {
    // Check which view is currently active and reload it
    if (app.querySelector('#dashboard-map')) {
      // Dashboard is active
      showDashboard()
    } else if (app.querySelector('#help-request-form')) {
      // Help request form is active
      showHelpForm()
    } else if (app.querySelector('#create-center-form')) {
      // Create center form is active
      showCreateCenter()
    } else if (app.querySelector('#flood-landslide-form')) {
      // Flood/Landslide form is active
      showFloodLandslideForm()
    }
  }
}) as EventListener)

// Note: Location permission is requested when user opens the help form
// iOS Safari requires user interaction before requesting location permission
// So we don't request it automatically on page load

const app = document.querySelector<HTMLDivElement>('#app')

// Define view functions in outer scope so they can be accessed by language change handler
let showDashboard: () => Promise<void>
let showHelpForm: () => void
let showCreateCenter: () => void
let showFloodLandslideForm: () => void

if (!app) {
  console.error('App element not found!')
} else {
  showDashboard = async () => {
    if (!app) return
    app.innerHTML = createDashboardHTML()
    await setupDashboard(app, showHelpForm, showCreateCenter, showFloodLandslideForm)
  }

  showHelpForm = () => {
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

  showCreateCenter = () => {
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

  showFloodLandslideForm = () => {
    if (!app) return
    app.innerHTML = createFloodLandslideFormHTML()
    setupFloodLandslideForm(app)
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

