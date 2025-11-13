# Auth Quick Reference

Panduan cepat untuk authentication pages.

## Pages Created

| Path | File | Role | Purpose |
|------|------|------|---------|
| `/` | `app/page.tsx` | Any | Landing page |
| `/patient/login` | `app/patient/login/page.tsx` | Patient | Login ke akun pasien |
| `/patient/signup` | `app/patient/signup/page.tsx` | Patient | Daftar akun pasien baru |
| `/doctor/login` | `app/doctor/login/page.tsx` | Doctor | Login ke akun dokter |
| `/doctor/signup` | `app/doctor/signup/page.tsx` | Doctor | Daftar akun dokter baru |
| `/doctor/verification` | `app/doctor/verification/page.tsx` | Doctor | Verifikasi email dokter |

## Quick Links

- **Landing Page**: http://localhost:3000/
- **Patient Login**: http://localhost:3000/patient/login
- **Patient Signup**: http://localhost:3000/patient/signup
- **Doctor Login**: http://localhost:3000/doctor/login
- **Doctor Signup**: http://localhost:3000/doctor/signup

## Key Features

### ✅ Patient Login
- Email/password authentication
- Show/hide password toggle
- Remember me checkbox
- Error handling
- Redirect to patient dashboard

### ✅ Patient Signup
- Full registration form
- Form validation
- Create Supabase auth account
- Create patient profile
- Automatic login after signup

### ✅ Doctor Login
- Email/password authentication
- Show/hide password toggle
- Remember me checkbox
- Redirect to doctor dashboard

### ✅ Doctor Signup
- Complete registration form
- Specialization dropdown
- License number input
- Form validation
- Create Supabase auth account
- Create doctor profile
- Email verification step

### ✅ Doctor Verification
- 6-digit code input
- Code verification
- Resend code button
- Success state with dashboard redirect

### ✅ Landing Page
- Professional design
- Feature showcase
- CTA buttons
- Navigation to auth pages
- Responsive layout
- Footer with links

## Form Fields

### Patient Signup
```
- Nama Lengkap (required)
- Email (required, must be unique)
- Nomor Telepon
- Tanggal Lahir
- Jenis Kelamin
- Password (min 6 chars)
- Konfirmasi Password (must match)
- Agree Terms (required)
```

### Doctor Signup
```
- Nama Lengkap (required)
- Email (required, must be unique)
- Nomor Telepon
- Spesialisasi (dropdown)
- Nomor Lisensi (required)
- Password (min 6 chars)
- Konfirmasi Password (must match)
- Agree Terms (required)
```

## API Endpoints

### POST `/api/auth/register-patient`
```javascript
// Request
{
  fullName: string,
  email: string,
  phone: string,
  dateOfBirth: string,
  gender: string
}

// Response (200 OK)
{ success: true, message: "Patient profile created" }
```

### POST `/api/auth/register-doctor`
```javascript
// Request
{
  fullName: string,
  email: string,
  phone: string,
  specialization: string,
  licenseNumber: string
}

// Response (200 OK)
{ success: true, message: "Doctor profile created" }
```

## Hooks Usage

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, signIn, signUp, signOut } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <p>Not logged in</p>;
  }

  // Get current user
  console.log(user.email);
  console.log(user.user_metadata?.role);

  // Sign in
  await signIn('email@example.com', 'password123');

  // Sign up
  await signUp('newemail@example.com', 'password123');

  // Sign out
  await signOut();
}
```

## URL Navigation

### From Patient Signup
- Success → `/patient/check` (automatic redirect)
- Already have account → `/patient/login`
- Are you a doctor? → `/doctor/login`

### From Doctor Signup
- Success → `/doctor/verification` (automatic redirect)
- Already have account → `/doctor/login`
- Back to home → `/`

### From Login Pages
- Don't have account → Signup page
- Forgot password → `/*/forgot-password`
- Success → Dashboard (`/patient` or `/doctor`)

## Styling Classes

```css
/* Buttons */
.btn-primary      /* Blue primary button */
.btn-secondary    /* Outline secondary button */

/* Forms */
.input-field      /* Input styling */
.label            /* Label styling */
.card             /* Card container */

/* Colors */
.bg-primary-50    /* Light blue background */
.text-primary-600 /* Blue text */
.bg-danger-50     /* Light red (errors) */
.text-danger-600  /* Red text */
.bg-success-100   /* Light green */
.bg-warning-100   /* Light yellow */
```

## Error Messages

### Login Errors
- "Email dan password harus diisi"
- "Format email tidak valid"
- "Email atau password salah"

### Signup Errors
- "Nama, email, dan password harus diisi"
- "Format email tidak valid"
- "Password minimal 6 karakter"
- "Password tidak cocok"
- "Nomor lisensi dokter harus diisi"
- "Anda harus menyetujui syarat dan ketentuan"
- "Gagal membuat profil [pasien/dokter]"

## Testing Checklist

- [ ] Patient signup with valid data
- [ ] Patient signup validation errors
- [ ] Patient login success
- [ ] Patient login failure
- [ ] Doctor signup with all fields
- [ ] Doctor specialization dropdown works
- [ ] Doctor email verification flow
- [ ] Landing page navigation
- [ ] All links work correctly
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Landing page: < 2s load time
- Login page: < 1s load time
- Signup page: < 1s load time
- Form submission: < 3s response time

## Accessibility

- ✓ Semantic HTML
- ✓ ARIA labels where needed
- ✓ Keyboard navigation
- ✓ Color contrast WCAG AA
- ✓ Form error announcements

## Dependencies

```json
{
  "@supabase/supabase-js": "^2.43.4",
  "react": "^19.0.0",
  "next": "^16.0.0"
}
```

## Environment Setup

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Database Tables Used

- `users` - Supabase auth users
- `patients` - Patient profiles
- `doctors` - Doctor profiles

## Next Actions

1. ✅ Create all auth pages
2. ✅ Implement form validation
3. ✅ Connect to Supabase auth
4. ✅ Create API routes for profile registration
5. ⏳ Create "Forgot Password" page
6. ⏳ Create "Reset Password" page
7. ⏳ Add email verification flow
8. ⏳ Create profile completion pages
9. ⏳ Add 2FA support (optional)
10. ⏳ Create admin user management

## Documentation Files

- `AUTH_PAGES_DOCUMENTATION.md` - Full detailed documentation
- `AUTH_QUICK_REFERENCE.md` - This file, quick lookup
- `SUPABASE_INTEGRATION.md` - Database integration guide

## Support

- **Email**: support@triageai.com
- **Docs**: Read AUTH_PAGES_DOCUMENTATION.md
- **GitHub Issues**: Report bugs
