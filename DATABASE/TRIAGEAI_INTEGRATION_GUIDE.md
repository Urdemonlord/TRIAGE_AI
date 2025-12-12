# TRIAGE.AI Supabase Integration Guide

## Tabel Reference

| Tabel | Deskripsi | Penggunaan Utama |
|-------|-----------|------------------|
| `triageai_patients` | Data pasien | Menyimpan profil & informasi kesehatan pasien |
| `triageai_records` | Hasil triage AI | Menyimpan hasil analisis gejala dari AI model |
| `triageai_doctor_notes` | Review dokter | Menyimpan catatan & diagnosis dokter |
| `triageai_notifications` | Notifikasi | Menyimpan notifikasi untuk pasien & dokter |

## TypeScript Types (Copy ke project Anda)

```typescript
// types/triageai.ts

export interface TriageAIPatient {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  chronic_conditions?: string[];
  medications?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface TriageAIRecord {
  id: string;
  patient_id: string;
  triage_id: string; // Format: TRG-20251212123456
  complaint: string;
  extracted_symptoms?: string[];
  numeric_data?: Record<string, any>;
  primary_category: string;
  category_confidence?: string;
  urgency_level: 'Green' | 'Yellow' | 'Red';
  urgency_score?: number;
  detected_flags?: Record<string, any>;
  summary?: string;
  category_explanation?: string;
  first_aid_advice?: string;
  result_json?: Record<string, any>;
  requires_doctor_review: boolean;
  doctor_reviewed: boolean;
  doctor_note_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TriageAIDoctorNote {
  id: string;
  triage_id: string;
  doctor_id: string;
  doctor_name: string;
  diagnosis?: string;
  notes?: string;
  prescription?: string;
  follow_up_needed: boolean;
  follow_up_date?: string;
  status: 'pending' | 'reviewed' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TriageAINotification {
  id: string;
  patient_id?: string;
  doctor_id?: string;
  triage_id?: string;
  type: 'red_case' | 'doctor_note' | 'follow_up' | 'general';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
```

## Helper Functions untuk Supabase Client

```typescript
// lib/supabase-triageai.ts

import { createClient } from '@supabase/supabase-js';
import type { TriageAIPatient, TriageAIRecord, TriageAIDoctorNote, TriageAINotification } from '@/types/triageai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============== PATIENT OPERATIONS ==============

export async function getPatientProfile(userId: string): Promise<TriageAIPatient | null> {
  const { data, error } = await supabase
    .from('triageai_patients')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching patient profile:', error);
    return null;
  }

  return data;
}

export async function createPatientProfile(patient: Omit<TriageAIPatient, 'id' | 'created_at' | 'updated_at'>): Promise<TriageAIPatient | null> {
  const { data, error } = await supabase
    .from('triageai_patients')
    .insert([patient])
    .select()
    .single();

  if (error) {
    console.error('Error creating patient profile:', error);
    return null;
  }

  return data;
}

export async function updatePatientProfile(userId: string, updates: Partial<TriageAIPatient>): Promise<TriageAIPatient | null> {
  const { data, error } = await supabase
    .from('triageai_patients')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient profile:', error);
    return null;
  }

  return data;
}

// ============== TRIAGE RECORD OPERATIONS ==============

export async function createTriageRecord(record: Omit<TriageAIRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TriageAIRecord | null> {
  const { data, error } = await supabase
    .from('triageai_records')
    .insert([record])
    .select()
    .single();

  if (error) {
    console.error('Error creating triage record:', error);
    return null;
  }

  return data;
}

export async function getPatientTriageRecords(patientId: string): Promise<TriageAIRecord[]> {
  const { data, error } = await supabase
    .from('triageai_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching triage records:', error);
    return [];
  }

  return data || [];
}

export async function getTriageRecord(triageId: string): Promise<TriageAIRecord | null> {
  const { data, error } = await supabase
    .from('triageai_records')
    .select('*')
    .eq('triage_id', triageId)
    .single();

  if (error) {
    console.error('Error fetching triage record:', error);
    return null;
  }

  return data;
}

export async function updateTriageRecord(triageRecordId: string, updates: Partial<TriageAIRecord>): Promise<TriageAIRecord | null> {
  const { data, error } = await supabase
    .from('triageai_records')
    .update(updates)
    .eq('id', triageRecordId)
    .select()
    .single();

  if (error) {
    console.error('Error updating triage record:', error);
    return null;
  }

  return data;
}

export async function getRedCaseTriageRecords(): Promise<TriageAIRecord[]> {
  const { data, error } = await supabase
    .from('triageai_records')
    .select('*')
    .eq('urgency_level', 'Red')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching red cases:', error);
    return [];
  }

  return data || [];
}

// ============== DOCTOR NOTE OPERATIONS ==============

export async function createDoctorNote(note: Omit<TriageAIDoctorNote, 'id' | 'created_at' | 'updated_at'>): Promise<TriageAIDoctorNote | null> {
  const { data, error } = await supabase
    .from('triageai_doctor_notes')
    .insert([note])
    .select()
    .single();

  if (error) {
    console.error('Error creating doctor note:', error);
    return null;
  }

  return data;
}

export async function getTriageNotes(triageRecordId: string): Promise<TriageAIDoctorNote[]> {
  const { data, error } = await supabase
    .from('triageai_doctor_notes')
    .select('*')
    .eq('triage_id', triageRecordId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching doctor notes:', error);
    return [];
  }

  return data || [];
}

export async function getDoctorNotes(doctorId: string): Promise<TriageAIDoctorNote[]> {
  const { data, error } = await supabase
    .from('triageai_doctor_notes')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching doctor notes:', error);
    return [];
  }

  return data || [];
}

// ============== NOTIFICATION OPERATIONS ==============

export async function getPatientNotifications(patientId: string): Promise<TriageAINotification[]> {
  const { data, error } = await supabase
    .from('triageai_notifications')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patient notifications:', error);
    return [];
  }

  return data || [];
}

export async function getDoctorNotifications(doctorId: string): Promise<TriageAINotification[]> {
  const { data, error } = await supabase
    .from('triageai_notifications')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching doctor notifications:', error);
    return [];
  }

  return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('triageai_notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function getUnreadNotificationCount(userId: string, isDoctor: boolean = false): Promise<number> {
  const field = isDoctor ? 'doctor_id' : 'patient_id';

  const { count, error } = await supabase
    .from('triageai_notifications')
    .select('*', { count: 'exact', head: true })
    .eq(field, userId)
    .eq('read', false);

  if (error) {
    console.error('Error counting unread notifications:', error);
    return 0;
  }

  return count || 0;
}

// ============== REALTIME SUBSCRIPTIONS ==============

export function subscribeToTriageChanges(patientId: string, callback: (record: TriageAIRecord) => void) {
  return supabase
    .channel(`triageai_records:patient_id=eq.${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'triageai_records',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => callback(payload.new as TriageAIRecord)
    )
    .subscribe();
}

export function subscribeToNotifications(userId: string, isDoctor: boolean = false, callback: (notification: TriageAINotification) => void) {
  const field = isDoctor ? 'doctor_id' : 'patient_id';

  return supabase
    .channel(`triageai_notifications:${field}=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'triageai_notifications',
        filter: `${field}=eq.${userId}`,
      },
      (payload) => callback(payload.new as TriageAINotification)
    )
    .subscribe();
}

export default supabase;
```

## Contoh Penggunaan di React Component

```typescript
// components/TriageForm.tsx
'use client';

import { useState } from 'react';
import { createTriageRecord, getPatientProfile } from '@/lib/supabase-triageai';
import { useAuth } from '@/contexts/AuthContext'; // atau auth provider Anda

export function TriageForm() {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get patient data
      const patient = await getPatientProfile(user!.id);
      if (!patient) {
        alert('Profil pasien tidak ditemukan');
        return;
      }

      // 2. Call AI API untuk analisis
      const aiResponse = await fetch('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint }),
      });

      const aiResult = await aiResponse.json();

      // 3. Save ke database
      const triageRecord = await createTriageRecord({
        patient_id: patient.id,
        triage_id: `TRG-${Date.now()}`,
        complaint,
        extracted_symptoms: aiResult.symptoms,
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
        alert('Triage berhasil disimpan!');
        setComplaint('');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={complaint}
        onChange={(e) => setComplaint(e.target.value)}
        placeholder="Jelaskan keluhan Anda..."
        required
        className="w-full p-3 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Menganalisis...' : 'Analisis Gejala'}
      </button>
    </form>
  );
}
```

## Realtime Notifications

```typescript
// hooks/useTriageNotifications.ts
'use client';

import { useEffect, useState } from 'react';
import { subscribeToNotifications, TriageAINotification } from '@/lib/supabase-triageai';

export function useTriageNotifications(userId: string, isDoctor: boolean = false) {
  const [notifications, setNotifications] = useState<TriageAINotification[]>([]);

  useEffect(() => {
    const subscription = subscribeToNotifications(userId, isDoctor, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId, isDoctor]);

  return notifications;
}
```

## Checklist Integrasi

- [ ] Copy types ke `lib/types/triageai.ts`
- [ ] Copy helper functions ke `lib/supabase-triageai.ts`
- [ ] Update components untuk menggunakan fungsi baru
- [ ] Update API routes untuk memanggil fungsi helper
- [ ] Test dengan sample data
- [ ] Monitor Supabase logs untuk errors
- [ ] Setup realtime notifications (opsional tapi recommended)

## Troubleshooting

### "User doesn't have access to this table"
- Pastikan RLS policies benar
- Check `auth.users` role metadata
- Pastikan user_id di auth.users sama dengan di triageai_patients

### "Notification tidak muncul"
- Check doctor role di auth metadata
- Verify trigger berfungsi di Supabase
- Lihat realtime log di Supabase dashboard

### Slow queries
- Pastikan indexes ada (sudah dibuat otomatis)
- Gunakan `.limit()` untuk pagination
- Cache data dengan React Query atau SWR

---

**Untuk pertanyaan lebih lanjut, lihat dokumentasi Supabase atau hubungi tim development.**
