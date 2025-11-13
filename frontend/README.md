# TRIAGE.AI - Frontend

Frontend aplikasi TRIAGE.AI built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AI Service backend running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles (Tailwind)
│   ├── patient/
│   │   ├── page.tsx            # Patient portal
│   │   ├── check/
│   │   │   └── page.tsx        # Triage form
│   │   └── result/
│   │       └── page.tsx        # Triage results
│   ├── doctor/
│   │   └── page.tsx            # Doctor dashboard (demo)
│   └── admin/
│       └── page.tsx            # Admin dashboard (demo)
├── components/                  # Reusable components (to be added)
├── lib/
│   └── api.ts                  # API client for backend
├── public/                      # Static assets
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── tsconfig.json               # TypeScript configuration
```

## 📡 API Integration

The frontend communicates with the FastAPI backend via the `/lib/api.ts` client.

**Environment Variable:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

By default, it connects to `localhost:8000`.

## 🎨 Pages Overview

### 1. Landing Page (`/`)
- Hero section dengan overview product
- Features showcase
- Demo hasil triase
- CTA ke patient check page

### 2. Patient Portal (`/patient`)
- Informasi untuk pasien
- Cara menggunakan sistem
- Features dan benefits
- Important disclaimers

### 3. Patient Check (`/patient/check`)
- Form input keluhan (free text)
- Quick symptom selection (checkbox)
- Real-time validation
- Submit ke AI backend

### 4. Results Page (`/patient/result`)
- Urgency level display (Green/Yellow/Red)
- Category prediction dengan confidence
- Red flags detected
- Extracted symptoms
- Recommendations
- Print & share options

### 5. Doctor Dashboard (`/doctor`)
- Case management table
- Filter by urgency/category
- Review pending cases
- Statistics overview
- *Demo mode - belum terintegrasi dengan database*

### 6. Admin Dashboard (`/admin`)
- System statistics
- Category distribution
- Urgency distribution
- System health status
- Quick actions
- *Demo mode - belum terintegrasi dengan database*

## 🎨 Design System

### Colors
- **Primary:** Blue (`#0ea5e9`)
- **Success:** Green (`#22c55e`) - Green urgency
- **Warning:** Orange (`#f59e0b`) - Yellow urgency
- **Danger:** Red (`#ef4444`) - Red urgency

### Components
Utility classes available:
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-danger` - Danger button
- `.card` - Card container
- `.input-field` - Input styling
- `.urgency-badge` - Urgency level badge
- `.urgency-green/yellow/red` - Urgency colors

## 🔧 Configuration

### Tailwind Config
Custom theme extensions in `tailwind.config.ts`:
- Primary color palette
- Success/Warning/Danger colors
- Custom utility classes

### Next.js Config
- React strict mode enabled
- Environment variable for API URL
- Image optimization

### TypeScript
- Strict mode enabled
- Path aliases: `@/*` → `./*`

## 🚧 Development Notes

### Current State
✅ Landing page complete
✅ Patient triage flow complete
✅ API integration working
✅ Results page with full details
⚠️ Doctor dashboard (demo mode)
⚠️ Admin dashboard (demo mode)
❌ Authentication (not implemented)
❌ Database integration (not implemented)

### To-Do for Production
- [ ] Add Supabase authentication
- [ ] Integrate doctor dashboard with database
- [ ] Add patient history feature
- [ ] Implement real-time notifications
- [ ] Add export to PDF feature
- [ ] Setup analytics tracking
- [ ] Add error boundary components
- [ ] Implement proper loading states
- [ ] Add form validation library (Zod/Yup)
- [ ] Setup E2E tests (Playwright/Cypress)

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Testing

### Manual Testing Checklist
1. **Landing Page**
   - [ ] All links work
   - [ ] CTA buttons navigate correctly
   - [ ] Responsive on mobile

2. **Patient Triage Flow**
   - [ ] Can input complaint
   - [ ] Quick symptoms work
   - [ ] Form validation working
   - [ ] Results display correctly
   - [ ] All urgency levels render properly

3. **API Integration**
   - [ ] Backend connection established
   - [ ] Error handling works
   - [ ] Loading states display

## 🐛 Known Issues

1. **lucide-react peer dependency warning**
   - Using `--legacy-peer-deps` to install
   - Waiting for lucide-react React 19 support

2. **Demo dashboards**
   - Doctor and Admin dashboards show mock data
   - Need database integration for real data

## 📦 Dependencies

### Core
- next@16.0.1
- react@19.2.0
- react-dom@19.2.0
- typescript@5.9.3

### Styling
- tailwindcss@4.1.17
- postcss@8.5.6
- autoprefixer@10.4.21

### Utilities
- axios@1.13.2 - HTTP client
- date-fns@3.6.0 - Date formatting
- lucide-react@0.294.0 - Icons (with legacy peer deps)

## 🚀 Build & Deploy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables for Production
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 📖 API Documentation

See `/lib/api.ts` for all available endpoints and TypeScript types.

Main endpoints:
- `POST /api/v1/triage` - Perform triage
- `POST /api/v1/analyze-symptoms` - Analyze symptoms only
- `POST /api/v1/check-urgency` - Check urgency only
- `GET /api/v1/categories` - Get available categories
- `GET /` - Health check

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

## 📝 License

Part of TRIAGE.AI - TeleHealth Intelligence System
