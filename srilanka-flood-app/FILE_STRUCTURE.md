# File Structure Documentation

This document describes the organized file structure of the Sri Lanka Flood Disaster Management Application.

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── HelpRequestForm.ts
│   ├── CreateCenterForm.ts
│   └── FloodLandslideForm.ts
├── pages/               # Page/View components
│   └── Dashboard.ts
├── services/            # API services and external integrations
│   └── api.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── i18n.ts
│   └── phone-formatter.ts
├── styles/              # CSS stylesheets
│   └── style.css
└── main.ts              # Application entry point
```

## File Organization

### `/components`
Reusable form components that can be used across different pages:
- **HelpRequestForm.ts** - Form for submitting help requests
- **CreateCenterForm.ts** - Form for creating disaster centers
- **FloodLandslideForm.ts** - Form for reporting floods/landslides

### `/pages`
Main page/view components:
- **Dashboard.ts** - Main dashboard page with map, statistics, and data tables

### `/services`
API services and external integrations:
- **api.ts** - All API calls to the backend server

### `/types`
TypeScript type definitions and interfaces:
- **index.ts** - All shared TypeScript interfaces (DisasterCenter, HelpRequest, FloodLandslideReport, etc.)

### `/utils`
Utility functions and helpers:
- **i18n.ts** - Internationalization (i18n) utilities for English/Sinhala translations
- **phone-formatter.ts** - Phone number formatting utilities

### `/styles`
Stylesheets:
- **style.css** - Main application styles

### Root
- **main.ts** - Application entry point that initializes the app

## Import Paths

When importing from these directories, use the following patterns:

```typescript
// Types
import type { DisasterCenter, HelpRequest } from './types/index.js'

// Services
import { fetchDisasterCenters, submitHelpRequest } from './services/api.js'

// Utils
import { t, getCurrentLanguage } from './utils/i18n.js'
import { formatPhoneNumber } from './utils/phone-formatter.js'

// Components
import { createHelpRequestForm, setupHelpRequestForm } from './components/HelpRequestForm.js'

// Pages
import { createDashboardHTML, setupDashboard } from './pages/Dashboard.js'

// Styles
import './styles/style.css'
```

## Benefits of This Structure

1. **Separation of Concerns** - Each directory has a clear purpose
2. **Scalability** - Easy to add new components, pages, or services
3. **Maintainability** - Related code is grouped together
4. **Reusability** - Components and utilities can be easily reused
5. **Type Safety** - Centralized type definitions ensure consistency

## Migration Notes

The old flat structure has been reorganized. Old files in `src/` root are kept for backward compatibility during migration, but new code should use the organized structure.

