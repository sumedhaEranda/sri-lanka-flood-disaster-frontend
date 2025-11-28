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

// Note: Location permission is requested when user opens the help form
// iOS Safari requires user interaction before requesting location permission
// So we don't request it automatically on page load

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

