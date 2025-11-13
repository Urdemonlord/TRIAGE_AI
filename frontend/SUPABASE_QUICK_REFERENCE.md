# Supabase Integration - Quick Reference

## 🎯 Installation (5 minutes)

### 1. Install Package
```bash
npm install @supabase/supabase-js
```

### 2. Setup Database
- Open Supabase Dashboard
- SQL Editor → Paste `createdb.sql` → Run

### 3. Run Dev Server
```bash
npm run dev
```

Done! ✅

---

## 💻 Common Code Patterns

### In a Client Component

#### Get User & Check Auth
```typescript
'use client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;

  return <div>Hello {user?.email}!</div>;
}
```

#### Get Patient Sessions
```typescript
'use client';
import { useTriageSessions } from '@/lib/hooks/useTriage';

export default function MyComponent() {
  const { sessions, loading, error } = useTriageSessions(patientId);

  return (
    <ul>
      {sessions.map(session => (
        <li key={session.id}>{session.complaint}</li>
      ))}
    </ul>
  );
}
```

#### Get Specific Session + Notes
```typescript
'use client';
import { useTriageSession } from '@/lib/hooks/useTriage';

export default function SessionDetail() {
  const { session, notes, loading } = useTriageSession(sessionId);

  return (
    <div>
      <h2>{session?.complaint}</h2>
      {notes.map(note => <p key={note.id}>{note.note}</p>)}
    </div>
  );
}
```

#### Get Pending Sessions (for doctors)
```typescript
'use client';
import { usePendingSessions } from '@/lib/hooks/useTriage';

export default function DoctorDashboard() {
  const { sessions, loading } = usePendingSessions();

  return <div>Pending: {sessions.length}</div>;
}
```

### In a Server Component or API Route

#### Get Current User
```typescript
import { authService } from '@/lib/supabase';

const user = await authService.getCurrentUser();
```

#### Get Patient Profile
```typescript
import { patientService } from '@/lib/db';

const { data: profile, error } = await patientService.getProfile(userId);
```

#### Create Triage Session
```typescript
import { triageSessionService } from '@/lib/db';

const { data: session, error } = await triageSessionService.create({
  patient_id: patientId,
  complaint: 'Sakit kepala',
  symptoms: ['headache'],
  categories: ['common_cold'],
  urgency: 'yellow',
  risk_score: 3.5,
  recommendation: 'Istirahat',
  summary: 'Pasien sakit kepala',
  status: 'pending',
});
```

#### Create Triage Note (Doctor)
```typescript
import { triageNoteService } from '@/lib/db';

const { data: note, error } = await triageNoteService.create({
  session_id: sessionId,
  doctor_id: doctorId,
  note: 'Istirahat 2 hari',
  decision: 'approved',
});
```

#### Log Audit
```typescript
import { auditLogService } from '@/lib/db';

await auditLogService.log({
  actor_id: userId,
  entity: 'triage_sessions',
  action: 'create',
  before: {},
  after: { session_id: '123' },
});
```

---

## 🔌 API Endpoints

### Triage
```bash
# Create Session
POST /api/triage
Body: { complaint, symptoms[], patient_data }

# Get Notes
GET /api/triage/[sessionId]/notes

# Add Note
POST /api/triage/[sessionId]/notes
Body: { note, decision: 'approved|rejected|modified' }
```

### Auth
```bash
# Register Patient
POST /api/auth/register-patient
Body: { name, gender, dob, phone }

# Register Doctor
POST /api/auth/register-doctor
Body: { name, specialization, license_no }
```

---

## 🎨 Component Example

### Patient Check Form with Supabase
```typescript
'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CheckForm() {
  const { user, isAuthenticated } = useAuth();
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint }),
      });

      const result = await response.json();
      console.log('Session ID:', result.session_id);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={complaint}
        onChange={(e) => setComplaint(e.target.value)}
        placeholder="Describe your symptoms..."
      />
      <button disabled={loading}>{loading ? 'Analyzing...' : 'Check'}</button>
    </form>
  );
}
```

---

## 🔍 Error Handling Pattern

```typescript
const { data, error } = await patientService.getProfile(userId);

if (error) {
  console.error('Error:', error.message);
  // Handle error
  return null;
}

// Use data
console.log('Profile:', data);
```

---

## 📋 Checklist

- [ ] Run `npm install @supabase/supabase-js`
- [ ] Execute `createdb.sql` in Supabase
- [ ] Verify `.env.local` has Supabase credentials
- [ ] Run `npm run dev`
- [ ] Test API endpoints with Postman
- [ ] Update patient check page with hooks
- [ ] Update doctor dashboard with pending sessions
- [ ] Test full flow: signup → check → doctor review

---

## ⚡ Pro Tips

1. **Always use hooks in Client Components**
   ```typescript
   'use client';
   import { useAuth } from '@/lib/hooks/useAuth';
   ```

2. **Always use services in Server Components/API Routes**
   ```typescript
   import { authService } from '@/lib/supabase';
   ```

3. **Return { data, error } from all services**
   ```typescript
   const { data, error } = await service.method();
   if (error) throw error;
   ```

4. **Always log important actions**
   ```typescript
   await auditLogService.log({...});
   ```

5. **Check authentication before API calls**
   ```typescript
   if (!isAuthenticated) {
     router.push('/login');
     return;
   }
   ```

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client & auth |
| `lib/db.ts` | Database services |
| `lib/hooks/useAuth.ts` | Auth hook |
| `lib/hooks/useTriage.ts` | Triage hooks |
| `app/api/triage/route.ts` | Create session API |
| `app/api/triage/[id]/notes/route.ts` | Notes API |
| `app/api/auth/register-*.ts` | Profile registration API |
| `.env.local` | Environment config |
| `SUPABASE_INTEGRATION.md` | Full documentation |

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Module not found | `npm install @supabase/supabase-js` |
| Env vars missing | Check `.env.local` |
| Table not found | Run `createdb.sql` |
| Unauthorized | Implement login first |
| RLS blocks query | Disable RLS for dev |

---

**Need help?** See `SUPABASE_INTEGRATION.md` for complete documentation.
