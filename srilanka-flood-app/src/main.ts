import './style.css'
import { createDashboardHTML, setupDashboard } from './disaster-centers.ts'
import { createHomelessHelpForm, setupHomelessHelpForm } from './homeless-help.ts'
import { createCenterFormHTML, setupCreateCenterForm } from './create-center.ts'

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

