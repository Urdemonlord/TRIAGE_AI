# 🚀 TRIAGE.AI - Frontend Optimization & Backend Sync Guide

## 📋 Panduan Lengkap Optimasi Frontend

**Tujuan:** Frontend yang cantik, cepat, dan ter-sync sempurna dengan backend

---

## ✅ 1. Database Setup (WAJIB DILAKUKAN PERTAMA!)

### Step 1: Buka Supabase Dashboard

1. Login ke: https://supabase.com/dashboard
2. Pilih project Anda: `xxplcakpmqqfjrarchyd`
3. Klik **SQL Editor** di sidebar kiri

### Step 2: Run Database Schema

1. Copy semua isi file: `database/setup-database.sql`
2. Paste ke SQL Editor
3. Klik **Run** (atau Ctrl + Enter)
4. Tunggu sampai muncul: `"Database setup complete!"`

### Step 3: Verifikasi Tables

Di **Table Editor**, pastikan ada 4 tabel:
- ✅ `patients` - Data pasien
- ✅ `triage_records` - Hasil triase
- ✅ `doctor_notes` - Catatan dokter
- ✅ `notifications` - Notifikasi real-time

### Step 4: Create Test User

Di **SQL Editor**, jalankan:

```sql
-- Create demo patient
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'patient@demo.com',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  '{"role": "patient"}'::jsonb
);

-- Create demo doctor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  'doctor@demo.com',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  '{"role": "doctor"}'::jsonb
);
```

**Demo Login:**
- Pasien: `patient@demo.com` / `demo123`
- Dokter: `doctor@demo.com` / `demo123`

---

## ✅ 2. Environment Variables Check

### Frontend `.env.local`

Pastikan file ini ada dan lengkap:

```env
# Supabase (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Service URL
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_URL=http://localhost:8000

# LLM API (SumoPod AI)
LLM_API_KEY=sk-JPw3J0m2-1f2FY1XgbMuXw
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini
```

### Backend `.env`

Di folder `ai-service/`:

```env
# Supabase (Backend)
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
SUPABASE_ANON_PUBLIC=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LLM API
LLM_API_KEY=sk-JPw3J0m2-1f2FY1XgbMuXw
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini

# Redis (Optional)
REDIS_URL=redis://localhost:6379/0
```

---

## ✅ 3. Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

**Dependencies yang sudah terinstall:**
- `next@15.1.3` - Framework utama
- `react@19.0.0` - UI library
- `tailwindcss@3.4.1` - Styling
- `@supabase/supabase-js` - Database client
- `react-hot-toast` - Notifications
- `axios` - HTTP client

### Backend

```bash
cd ai-service
pip install -r requirements.txt
```

**Dependencies:**
- `fastapi` - API framework
- `uvicorn` - ASGI server
- `openai` - LLM integration
- `scikit-learn` - ML model
- `redis` - Caching
- `supabase` - Database

---

## ✅ 4. Start Development Servers

### Terminal 1: Backend (AI Service)

```bash
cd ai-service
python -m uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
✓ Model loaded successfully
[+] LLM Service initialized: gpt-4o-mini
```

**Test backend:**
- Health check: http://localhost:8000
- API docs: http://localhost:8000/docs

### Terminal 2: Frontend (Next.js)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
   ▲ Next.js 15.1.3
   - Local:        http://localhost:3000
   - Ready in 2.5s
```

**Test frontend:**
- Home: http://localhost:3000
- Login: http://localhost:3000/auth/login
- Wizard: http://localhost:3000/patient/check-wizard

---

## ✅ 5. Frontend Optimization Checklist

### 5.1 Loading States ✅

**Dimana digunakan:**

**Patient Pages:**
- `/patient/check-wizard` - Form wizard loading
- `/patient/history` - Triage records loading
- `/patient/profile` - Profile data loading

**Doctor Pages:**
- `/doctor/dashboard` - Dashboard loading
- Queue list loading
- Note submission loading

**Cara pakai:**

```tsx
import { Spinner, LoadingOverlay, CardSkeleton } from '@/components/LoadingSkeleton';

function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <CardSkeleton />;
  }

  return <div>Content...</div>;
}
```

**Jenis Skeleton:**
- `<CardSkeleton />` - Card loading
- `<TriageCardSkeleton />` - Triage card
- `<TableSkeleton rows={5} />` - Table/list
- `<StatCardSkeleton />` - Statistics card
- `<FormSkeleton />` - Form loading
- `<ProfileSkeleton />` - Profile page
- `<Spinner size="lg" />` - Simple spinner
- `<LoadingOverlay message="..." />` - Full screen

---

### 5.2 Error Handling ✅

**Error Boundary Setup:**

Sudah ada di `components/ErrorBoundary.tsx`

**Cara pakai:**

```tsx
import { ErrorBoundary, ErrorFallback } from '@/components/ErrorBoundary';

function MyPage() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}

// Or dengan custom fallback
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

**Try-Catch Pattern:**

```tsx
try {
  const result = await triageAPI.performTriage({ complaint });
  // Success handling
} catch (error: any) {
  console.error('Triage error:', error);
  toast.error(error.message || 'Terjadi kesalahan');
}
```

---

### 5.3 Toast Notifications ✅

**Sudah terintegrasi:**
- `react-hot-toast` di layout
- `NotificationContext` untuk real-time notifications

**Cara pakai:**

```tsx
import toast from 'react-hot-toast';

// Success
toast.success('Data berhasil disimpan!');

// Error
toast.error('Gagal menyimpan data');

// Loading
const loadingToast = toast.loading('Menganalisis...');
// ... do async work
toast.dismiss(loadingToast);
toast.success('Selesai!');

// Custom
toast.custom((t) => (
  <div className="bg-white p-4 rounded-lg shadow-lg">
    <p>Custom notification</p>
  </div>
));
```

**Real-time Notifications:**

```tsx
import { useNotifications } from '@/contexts/NotificationContext';

function DoctorDashboard() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div>
      <span className="badge">{unreadCount}</span>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

---

### 5.4 Animations ✅

**Sudah tersedia di `globals.css`:**

```css
.animate-fade-in { animation: fadeIn 0.3s ease-in; }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
.animate-pulse-slow { animation: pulse 3s infinite; }
.skeleton { /* shimmer effect */ }
```

**Cara pakai:**

```tsx
// Fade in
<div className="animate-fade-in">
  Content appears smoothly
</div>

// Slide in (toast, modals)
<div className="animate-slide-in">
  Slides from right
</div>

// Pulse (loading indicators)
<div className="animate-pulse-slow">
  Gentle pulsing
</div>

// Skeleton shimmer
<div className="skeleton h-4 w-full rounded"></div>
```

**Page Transitions:**

Sudah otomatis dengan Next.js App Router!

---

### 5.5 Dark Mode ✅

**Sudah ter-setup lengkap:**

```tsx
// Toggle component
import DarkModeToggle from '@/components/DarkModeToggle';
<DarkModeToggle />

// Use theme in component
import { useTheme } from '@/contexts/ThemeContext';
const { theme, toggleTheme } = useTheme();

// Tailwind dark: classes
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-white">Text</p>
</div>
```

**Persistent:** Theme tersimpan di localStorage

---

### 5.6 Multi-Language ✅

**Sudah ter-setup:**

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t.heroTitle}</h1>
      <button onClick={() => setLanguage('jv')}>
        Bahasa Jawa
      </button>
    </div>
  );
}
```

**Languages:**
- `id` - Bahasa Indonesia
- `jv` - Basa Jawa

---

### 5.7 Mobile Responsiveness ✅

**Tailwind breakpoints:**

```tsx
<div className="
  grid
  grid-cols-1    /* mobile: 1 column */
  md:grid-cols-2  /* tablet: 2 columns */
  lg:grid-cols-3  /* desktop: 3 columns */
  gap-4
">
  <Card />
  <Card />
  <Card />
</div>

/* Responsive text */
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

/* Hide on mobile */
<div className="hidden md:block">
  Desktop only
</div>

/* Show on mobile only */
<div className="block md:hidden">
  Mobile only
</div>
```

**Sudah responsive:**
- ✅ Navbar (hamburger menu)
- ✅ Forms (full width on mobile)
- ✅ Tables (scroll horizontal)
- ✅ Cards (stack on mobile)
- ✅ Modals (full screen on mobile)

---

### 5.8 Performance Optimization ✅

**Code Splitting (Automatic):**

Next.js automatically splits code per page.

**Dynamic Imports:**

```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic';

const BodyMap = dynamic(() => import('@/components/BodyMap'), {
  loading: () => <Spinner />,
  ssr: false // Client-side only
});

const ImageUpload = dynamic(() => import('@/components/ImageUpload'));
```

**Image Optimization:**

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
  placeholder="blur" // Loading blur
/>
```

**API Call Optimization:**

```tsx
// Parallel requests
const [result1, result2, result3] = await Promise.all([
  fetch('/api/1'),
  fetch('/api/2'),
  fetch('/api/3'),
]);

// Caching with React Query (optional upgrade)
// Or use built-in Next.js cache
```

---

### 5.9 SEO Optimization ✅

**Meta Tags:**

```tsx
// In page.tsx
export const metadata = {
  title: 'TRIAGE.AI - Cek Gejala Kesehatan',
  description: 'Sistem triase cerdas berbasis AI...',
  keywords: 'triage, AI, kesehatan, Indonesia',
  openGraph: {
    title: 'TRIAGE.AI',
    description: '...',
    images: ['/og-image.jpg'],
  },
};
```

**Structured Data:**

```tsx
// In layout or page
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'TRIAGE.AI',
      description: '...',
      applicationCategory: 'HealthApplication',
    }),
  }}
/>
```

---

## ✅ 6. Backend Sync Verification

### 6.1 Test API Endpoints

**Health Check:**
```bash
curl http://localhost:8000
# Expected: {"status":"online","model_loaded":true}
```

**Triage Endpoint:**
```bash
curl -X POST http://localhost:8000/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{"complaint":"Sakit kepala dan demam"}'
```

**Image Analysis:**
```bash
curl -X POST http://localhost:8000/api/v1/analyze-image \
  -H "Content-Type: application/json" \
  -d '{"image_base64":"data:image/jpeg;base64,...","complaint":"Ruam kulit"}'
```

### 6.2 Test Database Connection

Di Supabase SQL Editor:

```sql
-- Check patients
SELECT * FROM patients LIMIT 5;

-- Check triage records
SELECT * FROM triage_records ORDER BY created_at DESC LIMIT 10;

-- Check notifications
SELECT * FROM notifications WHERE read = false;
```

### 6.3 Test Real-time Features

1. Login as patient: `patient@demo.com`
2. Submit triage dengan urgency Red
3. Login as doctor di tab lain: `doctor@demo.com`
4. Check if notification muncul otomatis ✅

---

## ✅ 7. Common Issues & Solutions

### Issue 1: Database Connection Failed

**Error:** `could not connect to database`

**Solution:**
```bash
# Check .env variables
cat frontend/.env.local | grep SUPABASE

# Verify Supabase URL
ping xxplcakpmqqfjrarchyd.supabase.co

# Reset connection
npm run dev (restart)
```

### Issue 2: AI Service Tidak Respon

**Error:** `fetch failed to http://localhost:8000`

**Solution:**
```bash
# Check if backend running
curl http://localhost:8000

# Restart backend
cd ai-service
python -m uvicorn app.main:app --reload --port 8000

# Check port conflict
netstat -ano | findstr :8000
```

### Issue 3: Model Not Loaded

**Error:** `Model not loaded`

**Solution:**
```bash
cd ai-service
python train_model_large.py
# Wait for training to complete
# Restart backend
```

### Issue 4: Toast Not Showing

**Solution:**
```tsx
// Make sure react-hot-toast installed
npm install react-hot-toast

// Check Toaster in layout
<Toaster position="top-right" />
```

### Issue 5: Dark Mode Flicker

**Solution:**
```tsx
// In ThemeContext, add to useEffect:
if (typeof window !== 'undefined') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// Add suppressHydrationWarning to html tag
<html lang="id" suppressHydrationWarning>
```

---

## ✅ 8. Production Deployment Checklist

### Before Deploy:

- [ ] Run `npm run build` → Check for errors
- [ ] Test all pages manually
- [ ] Check mobile responsiveness (Chrome DevTools)
- [ ] Test dark mode on all pages
- [ ] Verify API endpoints work
- [ ] Check database RLS policies
- [ ] Remove console.logs
- [ ] Update environment variables for production
- [ ] Setup error monitoring (Sentry optional)
- [ ] Configure CSP headers
- [ ] Enable HTTPS
- [ ] Setup CDN for static assets

### Performance Goals:

- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Lighthouse Score > 90
- ✅ Cumulative Layout Shift < 0.1

---

## ✅ 9. Testing Guide

### Manual Testing Flow:

**Patient Flow:**
1. Register → Login
2. Go to `/patient/check-wizard`
3. Fill Step 1-4
4. Submit triage
5. Check result page
6. Go to `/patient/history`
7. Click record → See details
8. Go to `/patient/profile`
9. Edit profile → Save
10. Logout

**Doctor Flow:**
1. Login as doctor
2. Go to `/doctor/dashboard`
3. See unreviewed triages
4. Click Red urgency case
5. Add doctor note
6. Submit review
7. Check notification badge
8. Logout

**UX Testing:**
1. Toggle dark mode → Check all pages
2. Change language ID → JV
3. Upload image in wizard
4. Click body map → Auto-select symptoms
5. Test on mobile (responsive)

---

## ✅ 10. File Structure Reference

```
TRIAGE.AI/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout (providers)
│   │   ├── page.tsx                ← Home page
│   │   ├── globals.css             ← Global styles + animations
│   │   ├── api/
│   │   │   └── analyze-image/      ← Vision API proxy
│   │   ├── auth/
│   │   │   ├── login/              ← Login page
│   │   │   └── register/           ← Register page
│   │   ├── patient/
│   │   │   ├── check/              ← Simple form
│   │   │   ├── check-wizard/       ← Multi-step wizard ⭐
│   │   │   ├── history/            ← Triage history
│   │   │   └── profile/            ← Patient profile
│   │   └── doctor/
│   │       └── dashboard/          ← Doctor queue
│   ├── components/
│   │   ├── BodyMap.tsx             ← Interactive body diagram ⭐
│   │   ├── DarkModeToggle.tsx      ← Theme switcher
│   │   ├── ErrorBoundary.tsx       ← Error handling ⭐
│   │   ├── ImageUpload.tsx         ← Vision AI upload ⭐
│   │   ├── LanguageSwitcher.tsx    ← i18n selector
│   │   ├── LoadingSkeleton.tsx     ← Loading states ⭐
│   │   └── Toast.tsx               ← Toast notifications ⭐
│   ├── contexts/
│   │   ├── AuthContext.tsx         ← Auth state
│   │   ├── LanguageContext.tsx     ← Multi-lang state
│   │   ├── NotificationContext.tsx ← Realtime notifs
│   │   └── ThemeContext.tsx        ← Dark mode state
│   ├── lib/
│   │   ├── api.ts                  ← API client
│   │   ├── supabase.ts             ← Database client
│   │   ├── translations.ts         ← i18n strings ⭐
│   │   └── notifications-client.ts ← Notification service
│   └── ...
├── ai-service/
│   ├── app/
│   │   ├── main.py                 ← FastAPI app
│   │   ├── models/                 ← ML models
│   │   ├── utils/
│   │   │   └── llm_service.py      ← LLM + Vision API ⭐
│   │   └── data/
│   │       └── trained_model/      ← Model files
│   └── ...
├── database/
│   ├── setup-database.sql          ← Schema setup ⭐
│   └── migrations/
└── docs/
    ├── SETUP_GUIDE.md
    ├── PHASE2_COMPLETE.md
    ├── UX_IMPROVEMENTS_COMPLETE.md
    ├── UX_IMPROVEMENTS_PART2_COMPLETE.md
    └── FRONTEND_OPTIMIZATION_GUIDE.md ← This file ⭐
```

---

## 🎯 Quick Start Command

Jalankan semua dalam 3 terminal:

**Terminal 1 - Backend:**
```bash
cd ai-service && python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

**Terminal 3 - Setup (first time only):**
```bash
# 1. Setup database (copy paste ke Supabase SQL Editor)
cat database/setup-database.sql

# 2. Install deps (if not done)
cd frontend && npm install
cd ../ai-service && pip install -r requirements.txt

# 3. Train model (if needed)
cd ai-service && python train_model_large.py
```

---

## 📞 Support

**Issues?**
- Check console for errors (F12)
- Check backend logs
- Verify database tables exist
- Test API endpoints with curl

**Need Help?**
- GitHub Issues: https://github.com/Urdemonlord/TRIAGE_AI/issues
- Documentation: All `*.md` files in root

---

**Last Updated:** November 2025
**Status:** Production Ready ✅
**Frontend Optimization:** Complete ✅
**Backend Sync:** Verified ✅

**Built with ❤️ by MeowLabs / UNIMUS**
