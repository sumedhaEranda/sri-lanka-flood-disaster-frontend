# Clean Project Structure - Implementation Guide

## ✅ Cleaned Structure

```
src/
├── main.ts                    # Application entry point
├── index.html                 # HTML entry point
│
├── components/                # Reusable UI components
│   ├── CreateCenterForm.ts   # Create disaster center form
│   ├── FloodLandslideForm.ts # Flood/landslide reporting form
│   └── HelpRequestForm.ts   # Help request form
│
├── pages/                     # Page-level components
│   └── Dashboard.ts          # Main dashboard page
│
├── services/                  # API and external services
│   └── api.ts                 # All API calls and types
│
├── types/                     # TypeScript type definitions
│   └── index.ts              # Shared type definitions
│
├── utils/                     # Utility functions
│   ├── i18n.ts               # Internationalization (English/Sinhala)
│   └── phone-formatter.ts    # Phone number formatting utilities
│
└── styles/                    # CSS styles
    └── style.css             # Main stylesheet
```

## ✅ Files Deleted (Duplicates/Unused)

- ✅ `src/api.ts` → Use `src/services/api.ts`
- ✅ `src/i18n.ts` → Use `src/utils/i18n.ts`
- ✅ `src/phone-formatter.ts` → Use `src/utils/phone-formatter.ts`
- ✅ `src/disaster-centers.ts` → Use `src/pages/Dashboard.ts`
- ✅ `src/homeless-help.ts` → Use `src/components/HelpRequestForm.ts`
- ✅ `src/create-center.ts` → Use `src/components/CreateCenterForm.ts`
- ✅ `src/flood-landslide.ts` → Use `src/components/FloodLandslideForm.ts`
- ✅ `src/counter.ts` → Unused file
- ✅ `src/typescript.svg` → Unused asset
- ✅ `src/style.css` → Use `src/styles/style.css`

## ✅ Updated Import Paths

### main.ts
```typescript
import './styles/style.css'
import { createDashboardHTML, setupDashboard } from './pages/Dashboard.ts'
import { createHomelessHelpForm, setupHomelessHelpForm } from './components/HelpRequestForm.ts'
import { createCenterFormHTML, setupCreateCenterForm } from './components/CreateCenterForm.ts'
import { createFloodLandslideFormHTML, setupFloodLandslideForm } from './components/FloodLandslideForm.ts'
import { getCurrentLanguage, setLanguage } from './utils/i18n.ts'
```

### Components (HelpRequestForm.ts, FloodLandslideForm.ts, CreateCenterForm.ts)
```typescript
// API imports
import { ... } from '../services/api.ts'

// Utils imports
import { ... } from '../utils/i18n.ts'
import { ... } from '../utils/phone-formatter.ts'

// Types imports
import type { ... } from '../types/index.ts'
```

### Pages (Dashboard.ts)
```typescript
// API imports
import { ... } from '../services/api.ts'

// Utils imports
import { ... } from '../utils/i18n.ts'

// Types imports
import type { ... } from '../types/index.ts'
```

## 📁 File Organization Rules

### Components (`src/components/`)
- **Purpose**: Reusable UI components/forms
- **Naming**: PascalCase (e.g., `HelpRequestForm.ts`)
- **Exports**: Component functions (e.g., `createHelpRequestFormHTML()`, `setupHelpRequestForm()`)

### Pages (`src/pages/`)
- **Purpose**: Page-level components (full page views)
- **Naming**: PascalCase (e.g., `Dashboard.ts`)
- **Exports**: Page functions (e.g., `createDashboardHTML()`, `setupDashboard()`)

### Services (`src/services/`)
- **Purpose**: API calls, external service integrations
- **Naming**: camelCase (e.g., `api.ts`)
- **Exports**: API functions, service functions

### Types (`src/types/`)
- **Purpose**: TypeScript type definitions, interfaces
- **Naming**: camelCase (e.g., `index.ts`)
- **Exports**: Type definitions, interfaces

### Utils (`src/utils/`)
- **Purpose**: Utility functions, helpers
- **Naming**: camelCase (e.g., `i18n.ts`, `phone-formatter.ts`)
- **Exports**: Utility functions

### Styles (`src/styles/`)
- **Purpose**: CSS stylesheets
- **Naming**: kebab-case (e.g., `style.css`)

## 🔄 Import Path Conventions

### Relative Paths
- **From components**: `../services/`, `../utils/`, `../types/`
- **From pages**: `../services/`, `../utils/`, `../types/`, `../components/`
- **From main.ts**: `./pages/`, `./components/`, `./utils/`, `./styles/`

### Absolute Paths (if configured)
- Use `@/` alias for `src/` (requires Vite config)

## 📝 Best Practices

1. **Single Responsibility**: Each file should have one clear purpose
2. **No Duplicates**: One source of truth for each functionality
3. **Consistent Naming**: Follow the naming conventions above
4. **Type Safety**: Use TypeScript types from `src/types/`
5. **Import Organization**: Group imports (external, internal, types)
6. **Barrel Exports**: Use `index.ts` for cleaner imports (optional)

## 🚀 Next Steps

1. ✅ All duplicate files removed
2. ✅ All imports updated
3. ✅ Structure cleaned
4. ⏭️ Test the application
5. ⏭️ Build and verify no errors

## 📦 Dependencies

The project uses:
- **Vite** - Build tool
- **TypeScript** - Type safety
- No React (vanilla TypeScript)

## 🧪 Testing the Clean Structure

Run:
```bash
npm run build
```

If build succeeds, the structure is clean! ✅

