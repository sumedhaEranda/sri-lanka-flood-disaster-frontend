# Clean Project Structure

## Current Issues Found:
1. ❌ Duplicate files: `api.ts` and `services/api.ts`
2. ❌ Duplicate files: `i18n.ts` and `utils/i18n.ts`
3. ❌ Duplicate files: `phone-formatter.ts` and `utils/phone-formatter.ts`
4. ❌ Old component files: `disaster-centers.ts`, `homeless-help.ts`, `create-center.ts`, `flood-landslide.ts`
5. ❌ Unused files: `counter.ts`, `typescript.svg`
6. ❌ Duplicate CSS: `style.css` and `styles/style.css`

## Recommended Clean Structure:

```
src/
├── main.ts                    # Application entry point
├── index.html                 # HTML entry point
│
├── components/                # Reusable UI components
│   ├── CreateCenterForm.ts
│   ├── FloodLandslideForm.ts
│   └── HelpRequestForm.ts
│
├── pages/                     # Page-level components
│   └── Dashboard.ts
│
├── services/                  # API and external services
│   └── api.ts                 # All API calls
│
├── types/                     # TypeScript type definitions
│   └── index.ts
│
├── utils/                     # Utility functions
│   ├── i18n.ts               # Internationalization
│   └── phone-formatter.ts    # Phone number utilities
│
└── styles/                    # CSS styles
    └── style.css              # Main stylesheet
```

## Files to DELETE (duplicates/unused):
- ❌ `src/api.ts` (use `src/services/api.ts` instead)
- ❌ `src/i18n.ts` (use `src/utils/i18n.ts` instead)
- ❌ `src/phone-formatter.ts` (use `src/utils/phone-formatter.ts` instead)
- ❌ `src/disaster-centers.ts` (use `src/pages/Dashboard.ts` instead)
- ❌ `src/homeless-help.ts` (use `src/components/HelpRequestForm.ts` instead)
- ❌ `src/create-center.ts` (use `src/components/CreateCenterForm.ts` instead)
- ❌ `src/flood-landslide.ts` (use `src/components/FloodLandslideForm.ts` instead)
- ❌ `src/counter.ts` (unused)
- ❌ `src/typescript.svg` (unused asset)
- ❌ `src/style.css` (use `src/styles/style.css` instead)

## Import Paths to Update:

### main.ts
```typescript
// OLD:
import { createDashboardHTML, setupDashboard } from './disaster-centers.ts'
import { createHomelessHelpForm, setupHomelessHelpForm } from './homeless-help.ts'
import { createCenterFormHTML, setupCreateCenterForm } from './create-center.ts'
import { createFloodLandslideFormHTML, setupFloodLandslideForm } from './flood-landslide.ts'
import { getCurrentLanguage, setLanguage } from './i18n.ts'
import './style.css'

// NEW:
import './styles/style.css'
import { createDashboardHTML, setupDashboard } from './pages/Dashboard.ts'
import { createHomelessHelpForm, setupHomelessHelpForm } from './components/HelpRequestForm.ts'
import { createCenterFormHTML, setupCreateCenterForm } from './components/CreateCenterForm.ts'
import { createFloodLandslideFormHTML, setupFloodLandslideForm } from './components/FloodLandslideForm.ts'
import { getCurrentLanguage, setLanguage } from './utils/i18n.ts'
```

### All component files should use:
```typescript
// API imports
import { ... } from '../services/api.ts'

// Utils imports
import { ... } from '../utils/i18n.ts'
import { ... } from '../utils/phone-formatter.ts'

// Types imports
import type { ... } from '../types/index.ts'
```

### Pages should use:
```typescript
// API imports
import { ... } from '../services/api.ts'

// Utils imports
import { ... } from '../utils/i18n.ts'

// Component imports (if needed)
import { ... } from '../components/...'
```

