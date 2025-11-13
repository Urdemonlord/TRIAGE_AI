# ⚡ QUICK START - Supabase Integration

## 🚀 3 Minutes to Get Started

### Step 1: Install (1 minute)
```bash
cd frontend
npm install @supabase/supabase-js
```

### Step 2: Initialize Database (1 minute)
1. Open https://app.supabase.com
2. SQL Editor → New Query
3. Copy-paste entire content from `DATABASE/createdb.sql`
4. Click **Run**

### Step 3: Run Dev Server (1 minute)
```bash
npm run dev
```

✅ **Done!** Server running at http://localhost:3000

---

## 📖 Documentation Links

| Need | Link |
|------|------|
| Full Setup Guide | [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) |
| Code Snippets | [`SUPABASE_QUICK_REFERENCE.md`](./SUPABASE_QUICK_REFERENCE.md) |
| Full API Docs | [`SUPABASE_INTEGRATION.md`](./SUPABASE_INTEGRATION.md) |
| Testing | [`SUPABASE_TESTING_GUIDE.md`](./SUPABASE_TESTING_GUIDE.md) |
| Everything | [`START_HERE.md`](./START_HERE.md) |

---

## 💻 Code Examples

### Use Authentication Hook
```typescript
'use client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, signIn } = useAuth();
  return <div>{isAuthenticated ? `Hello ${user?.email}` : 'Not logged in'}</div>;
}
```

### Get Patient Sessions
```typescript
'use client';
import { useTriageSessions } from '@/lib/hooks/useTriage';

export default function Sessions() {
  const { sessions, loading } = useTriageSessions(patientId);
  return <div>{sessions.length} sessions</div>;
}
```

### Create Triage Session
```typescript
const response = await fetch('/api/triage', {
  method: 'POST',
  body: JSON.stringify({ complaint: 'Sakit kepala' }),
});
const { session_id } = await response.json();
```

### Add Doctor Note
```typescript
await fetch(`/api/triage/${sessionId}/notes`, {
  method: 'POST',
  body: JSON.stringify({ note: 'Text', decision: 'approved' }),
});
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Client & auth |
| `lib/db.ts` | Database services |
| `lib/hooks/useAuth.ts` | Auth hook |
| `lib/hooks/useTriage.ts` | Triage hooks |
| `app/api/triage/route.ts` | Create session |
| `app/api/triage/[id]/notes/route.ts` | Doctor notes |
| `.env.local` | Config (already filled!) |

---

## ✅ Verify It Works

### Test 1: User Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","role":"patient"}'
```

### Test 2: Create Triage
```bash
curl -X POST http://localhost:3000/api/triage \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"complaint":"Headache"}'
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Module not found | `npm install @supabase/supabase-js` |
| Table not found | Run `createdb.sql` in Supabase |
| 401 Unauthorized | User not logged in - check auth |
| Env var missing | Check `.env.local` |

---

## 🎯 What's Integrated

✅ Complete Supabase auth  
✅ 6 database tables  
✅ 4 React hooks  
✅ 10 API endpoints  
✅ Audit logging  
✅ Type safety  
✅ 50+ test cases  

---

## 📚 Full Documentation

- **Setup:** [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) (5 min read)
- **Reference:** [`SUPABASE_QUICK_REFERENCE.md`](./SUPABASE_QUICK_REFERENCE.md) (10 min read)
- **Complete:** [`SUPABASE_INTEGRATION.md`](./SUPABASE_INTEGRATION.md) (reference)
- **Testing:** [`SUPABASE_TESTING_GUIDE.md`](./SUPABASE_TESTING_GUIDE.md) (testing)

---

**Ready?** Start with `npm install @supabase/supabase-js` 🚀
