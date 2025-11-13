# Auth Pages Documentation

Dokumentasi lengkap untuk semua halaman authentication di TRIAGE.AI.

## Overview

Sistem authentication terdiri dari halaman-halaman berikut:

### 1. Landing Page (`/`)
- **File**: `app/page.tsx`
- **Deskripsi**: Halaman utama yang menampilkan fitur dan mengajak user untuk mendaftar
- **Untuk**: Publik (belum login)
- **Navigasi**:
  - Pasien login: `/patient/login`
  - Pasien signup: `/patient/signup`
  - Dokter login: `/doctor/login`
  - Dokter signup: `/doctor/signup`

### 2. Patient Login (`/patient/login`)
- **File**: `app/patient/login/page.tsx`
- **Deskripsi**: Halaman login untuk pasien
- **Features**:
  - Email/password login
  - Show/hide password toggle
  - Remember me checkbox
  - Forgot password link
  - Redirect to patient dashboard after login

### 3. Patient Signup (`/patient/signup`)
- **File**: `app/patient/signup/page.tsx`
- **Deskripsi**: Halaman registrasi untuk pasien baru
- **Form Fields**:
  - Nama lengkap
  - Email
  - Nomor telepon
  - Tanggal lahir
  - Jenis kelamin
  - Password
  - Konfirmasi password
  - Agree terms & conditions checkbox
- **Flow**:
  1. Validasi form
  2. Create Supabase auth account
  3. Create patient profile via `/api/auth/register-patient`
  4. Redirect ke patient check page

### 4. Doctor Login (`/doctor/login`)
- **File**: `app/doctor/login/page.tsx`
- **Deskripsi**: Halaman login untuk dokter
- **Features**:
  - Email/password login
  - Show/hide password toggle
  - Remember me checkbox
  - Redirect ke doctor dashboard

### 5. Doctor Signup (`/doctor/signup`)
- **File**: `app/doctor/signup/page.tsx`
- **Deskripsi**: Halaman registrasi untuk dokter baru
- **Form Fields**:
  - Nama lengkap
  - Email
  - Nomor telepon
  - Spesialisasi (dropdown)
  - Nomor lisensi dokter
  - Password
  - Konfirmasi password
  - Agree terms & conditions checkbox
- **Flow**:
  1. Validasi form
  2. Create Supabase auth account
  3. Create doctor profile via `/api/auth/register-doctor`
  4. Redirect ke doctor verification page

### 6. Doctor Verification (`/doctor/verification`)
- **File**: `app/doctor/verification/page.tsx`
- **Deskripsi**: Halaman verifikasi email untuk dokter
- **Features**:
  - Input kode verifikasi 6 digit
  - Resend code button
  - Success state dengan redirect ke dashboard

## Authentication Flow

### Patient Registration Flow
```
Patient Signup Page
  ↓
Form Validation
  ↓
Create Auth Account (Supabase)
  ↓
Create Patient Profile
  ↓
Redirect → Patient Check Page
```

### Doctor Registration Flow
```
Doctor Signup Page
  ↓
Form Validation
  ↓
Create Auth Account (Supabase)
  ↓
Create Doctor Profile
  ↓
Redirect → Verification Page
  ↓ (Email verification)
Redirect → Doctor Dashboard
```

### Login Flow
```
Login Page
  ↓
Enter Email & Password
  ↓
Validate with Supabase Auth
  ↓
Success: Redirect to Dashboard
Fail: Show Error Message
```

## Styling & Components

### CSS Classes Used
- `btn-primary`: Primary button (blue)
- `btn-secondary`: Secondary button (outline)
- `input-field`: Input field dengan styling
- `label`: Form label
- `card`: Card container
- Color classes: `bg-primary-*`, `text-danger-*`, `bg-success-*`, `bg-warning-*`

### Icons
Menggunakan SVG icons yang di-inline di JSX untuk:
- Eye icon (show/hide password)
- Check icon (success)
- Error icon (error messages)
- Spinner (loading state)

## API Routes Required

### 1. `/api/auth/register-patient` (POST)
```typescript
// Body
{
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
}

// Response
{ success: true; message: string }
```

### 2. `/api/auth/register-doctor` (POST)
```typescript
// Body
{
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
}

// Response
{ success: true; message: string }
```

## Hooks Used

### useAuth()
Hook dari `lib/hooks/useAuth.ts` untuk:
- `signUp(email, password)`: Create new account
- `signIn(email, password)`: Login
- `signOut()`: Logout
- `user`: Current user object
- `isAuthenticated`: Auth state boolean

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Handling

Setiap page menangani errors:
- Email sudah terdaftar
- Password tidak cocok
- Format email invalid
- Password terlalu pendek
- Field kosong

Error ditampilkan dalam card merah dengan icon dan message.

## Validasi Form

### Patient Signup
- ✓ Nama lengkap tidak boleh kosong
- ✓ Email valid dan tidak boleh kosong
- ✓ Password minimal 6 karakter
- ✓ Password confirm harus match
- ✓ Must agree terms & conditions

### Doctor Signup
- ✓ Semua field harus diisi
- ✓ Email valid
- ✓ Password minimal 6 karakter
- ✓ Nomor lisensi tidak boleh kosong
- ✓ Must agree terms & conditions

## Responsive Design

Semua auth pages responsif:
- Mobile: Single column, full width
- Tablet: Slight padding adjustments
- Desktop: Centered card dengan max-width

## Next Steps

Setelah user login:
- **Patient**: Redirect ke `/patient/check` atau `/patient`
- **Doctor**: Redirect ke `/doctor` dashboard

## Testing Auth Flow

### Test Patient Registration
```bash
# 1. Go to /patient/signup
# 2. Fill form with test data
# 3. Submit
# 4. Should redirect to /patient/check
# 5. Check database for new patient profile
```

### Test Doctor Registration
```bash
# 1. Go to /doctor/signup
# 2. Fill form with doctor data
# 3. Submit
# 4. Should redirect to /doctor/verification
# 5. Complete verification
# 6. Should redirect to /doctor dashboard
```

### Test Login
```bash
# 1. Go to /patient/login or /doctor/login
# 2. Enter email & password
# 3. Submit
# 4. Should redirect to appropriate dashboard
```

## Files Structure
```
app/
├── page.tsx                    # Landing page
├── patient/
│   ├── login/page.tsx         # Patient login
│   └── signup/page.tsx        # Patient signup
├── doctor/
│   ├── login/page.tsx         # Doctor login
│   ├── signup/page.tsx        # Doctor signup
│   └── verification/page.tsx  # Doctor verification
└── api/
    └── auth/
        ├── register-patient/route.ts
        └── register-doctor/route.ts
```

## Security Notes

1. **Passwords**: Hashing dilakukan oleh Supabase Auth
2. **JWT Tokens**: Disimpan di Supabase session
3. **Email Verification**: Implemented via Supabase
4. **CORS**: Configured untuk allow frontend domain
5. **HTTPS**: Required untuk production

## Common Issues & Solutions

### Issue: Form validation not working
- Solution: Check browser console untuk error messages
- Ensure `@/lib/hooks/useAuth` is properly imported

### Issue: Redirect tidak terjadi setelah signup
- Solution: Check API routes return correct response
- Verify token disimpan dengan benar di session

### Issue: Email already registered
- Solution: Use unique email untuk test
- Check database untuk existing users
