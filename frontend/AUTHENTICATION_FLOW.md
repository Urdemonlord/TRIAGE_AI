# TRIAGE.AI Authentication Flow

## 📋 Overview

User harus login/daftar terlebih dahulu di frontend sebelum bisa mengirim gejala ke database. Setelah terverifikasi, data akan disimpan di Supabase dengan integrasi RLS (Row Level Security).

---

## 🔐 Authentication Architecture

```
User Interface (Frontend)
    ↓
[Supabase Auth] ← Email/Password or OAuth
    ↓
auth.users table
    ↓
triageai_patients (user_id reference)
    ↓
triageai_records (patient_id reference)
    ↓
Doctor (via simpus.meowlabs.id)
    ↓
triageai_doctor_notes
```

---

## 🚀 Implementation Steps

### Step 1: Setup Supabase Auth Client

```typescript
// lib/supabase-auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sign Up
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'patient',
      },
    },
  });

  if (error) {
    console.error('Sign up error:', error);
    return null;
  }

  return data;
}

// Sign In
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error);
    return null;
  }

  return data;
}

// Sign Out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign out error:', error);
}

// Get Current User
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Listen to Auth Changes
export function onAuthStateChange(callback: (user: any | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
}
```

### Step 2: Create Auth Context

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, getCurrentUser } from '@/lib/supabase-auth';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    getCurrentUser().then(setUser).finally(() => setLoading(false));

    // Listen for auth changes
    const subscription = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Step 3: Create Login/Signup Components

```typescript
// components/Auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from '@/lib/supabase-auth';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(email, password);

    if (result?.user) {
      router.push('/dashboard');
    } else {
      setError('Email atau password salah');
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Login SIMPUS TriageAI</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Belum punya akun? <a href="/signup" className="text-blue-600">Daftar disini</a>
      </p>
    </div>
  );
}
```

```typescript
// components/Auth/SignupForm.tsx
'use client';

import { useState } from 'react';
import { signUp } from '@/lib/supabase-auth';
import { createPatientProfile } from '@/lib/supabase-triageai';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create auth user
      const authResult = await signUp(email, password, fullName);

      if (!authResult?.user) {
        setError('Gagal membuat akun');
        setLoading(false);
        return;
      }

      // 2. Create patient profile
      const patient = await createPatientProfile({
        user_id: authResult.user.id,
        email,
        full_name: fullName,
        phone,
      });

      if (patient) {
        // Redirect to verify email or dashboard
        router.push('/auth/verify-email');
      } else {
        setError('Gagal membuat profil pasien');
      }
    } catch (err) {
      setError('Terjadi kesalahan');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Daftar SIMPUS TriageAI</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">No. Telepon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="08123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Membuat akun...' : 'Daftar'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Sudah punya akun? <a href="/login" className="text-blue-600">Login disini</a>
      </p>
    </div>
  );
}
```

### Step 4: Protected Triage Form

```typescript
// components/TriageForm/TriageForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createTriageRecord, getPatientProfile } from '@/lib/supabase-triageai';

export function TriageForm() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [complaint, setComplaint] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect to login if not authenticated
  if (!loading && !isAuthenticated) {
    return (
      <div className="p-6 border rounded-lg text-center">
        <h2 className="text-xl font-bold mb-4">Silakan login terlebih dahulu</h2>
        <p className="mb-4">Anda harus login untuk menggunakan sistem triage.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          Login Sekarang
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // 1. Get patient profile
      const patient = await getPatientProfile(user!.id);

      if (!patient) {
        setError('Profil pasien tidak ditemukan');
        setSubmitting(false);
        return;
      }

      // 2. Call AI analysis API
      const aiResponse = await fetch('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint,
          symptoms,
          age: 25, // could be from patient profile
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('Gagal menganalisis gejala');
      }

      const aiResult = await aiResponse.json();

      // 3. Save to database
      const triageRecord = await createTriageRecord({
        patient_id: patient.id,
        triage_id: `TRG-${Date.now()}`,
        complaint,
        extracted_symptoms: symptoms,
        primary_category: aiResult.category,
        urgency_level: aiResult.urgency,
        urgency_score: aiResult.score,
        category_confidence: aiResult.confidence,
        summary: aiResult.summary,
        category_explanation: aiResult.explanation,
        first_aid_advice: aiResult.firstAidAdvice,
        result_json: aiResult,
        requires_doctor_review: aiResult.urgency === 'Red',
      });

      if (triageRecord) {
        setSuccess('✓ Analisis gejala berhasil disimpan!');
        setComplaint('');
        setSymptoms([]);

        // Redirect to result page
        setTimeout(() => {
          router.push(`/triage-result/${triageRecord.triage_id}`);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat menyimpan analisis');
    }

    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-2">Diagnosis Awal TriageAI</h2>
      <p className="text-gray-600 mb-6">Pasien: {user?.email}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Keluhan Utama</label>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border rounded"
            placeholder="Jelaskan keluhan Anda secara detail. Contoh: Pusing, demam tinggi, batuk selama 3 hari..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Gejala Tambahan</label>
          <div className="space-y-2">
            {[
              'Demam',
              'Batuk',
              'Pilek',
              'Sakit Kepala',
              'Sakit Perut',
              'Mual',
              'Diare',
              'Sesak Napas',
            ].map((symptom) => (
              <label key={symptom} className="flex items-center">
                <input
                  type="checkbox"
                  checked={symptoms.includes(symptom)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSymptoms([...symptoms, symptom]);
                    } else {
                      setSymptoms(symptoms.filter((s) => s !== symptom));
                    }
                  }}
                  className="mr-2"
                />
                {symptom}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !complaint}
          className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50 font-medium"
        >
          {submitting ? 'Menganalisis...' : 'Analisis Gejala'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        💡 Sistem ini akan menganalisis gejala Anda dan mengirimkan hasil ke dokter untuk di-follow up di simpus.meowlabs.id
      </p>
    </div>
  );
}
```

### Step 5: Layout with Auth Provider

```typescript
// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 📍 Page Structure

```
/app
├── /auth
│   ├── login/page.tsx          (LoginForm)
│   ├── signup/page.tsx         (SignupForm)
│   └── verify-email/page.tsx   (Email verification)
├── /dashboard
│   └── page.tsx                (After login - Protected)
├── /triage
│   └── page.tsx                (TriageForm - Protected)
├── /triage-result
│   └── [triageId]/page.tsx     (Show results - Protected)
└── layout.tsx                  (AuthProvider wrapper)
```

---

## 🔒 Protected Routes

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (!session && req.nextUrl.pathname.startsWith('/triage')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/triage/:path*'],
};
```

---

## 📱 Flow Diagram

```
1. User visits simpus.meowlabs.id
   ↓
2. Not logged in → Show Login/Signup page
   ↓
3. User fills signup form (email, password, phone)
   ↓
4. Auth user created in auth.users
   ↓
5. Patient profile created in triageai_patients
   ↓
6. User redirected to /triage
   ↓
7. User fills complaint & symptoms
   ↓
8. Frontend calls /api/triage/analyze (AI processing)
   ↓
9. Results saved to triageai_records with user_id
   ↓
10. RLS Policy: Only this user can see their records
    ↓
11. Trigger: If Red urgency → Notify all doctors
    ↓
12. Doctor logs into simpus.meowlabs.id
    ↓
13. Doctor sees Red cases in dashboard
    ↓
14. Doctor creates note in triageai_doctor_notes
    ↓
15. Trigger: Patient gets notification
    ↓
16. Patient sees doctor's review
```

---

## ✅ Checklist

- [ ] Copy auth files ke lib/
- [ ] Create AuthContext
- [ ] Create LoginForm & SignupForm
- [ ] Create protected TriageForm
- [ ] Setup middleware for protected routes
- [ ] Add AuthProvider to root layout
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test data saving to triageai_patients
- [ ] Test doctor notification
- [ ] Deploy to simpus.meowlabs.id
