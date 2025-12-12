import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============ PATIENT PROFILE ============

export async function createPatientProfile(data: {
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
}) {
  try {
    const { data: patient, error } = await supabase
      .from('triageai_patients')
      .insert([
        {
          user_id: data.user_id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          age: data.age,
          gender: data.gender,
          blood_type: data.blood_type,
          allergies: data.allergies,
          chronic_conditions: data.chronic_conditions,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating patient:', error);
      return null;
    }

    return patient;
  } catch (err) {
    console.error('Exception creating patient:', err);
    return null;
  }
}

export async function getPatientProfile(userId: string) {
  try {
    const { data: patient, error } = await supabase
      .from('triageai_patients')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error getting patient:', error);
      return null;
    }

    return patient;
  } catch (err) {
    console.error('Exception getting patient:', err);
    return null;
  }
}

export async function updatePatientProfile(
  userId: string,
  updates: Record<string, any>
) {
  try {
    const { data: patient, error } = await supabase
      .from('triageai_patients')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating patient:', error);
      return null;
    }

    return patient;
  } catch (err) {
    console.error('Exception updating patient:', err);
    return null;
  }
}

// ============ TRIAGE RECORDS ============

export async function createTriageRecord(data: {
  patient_id: string;
  triage_id: string;
  complaint: string;
  extracted_symptoms: string[];
  primary_category: string;
  urgency_level: 'Red' | 'Yellow' | 'Green';
  urgency_score: number;
  category_confidence: number;
  summary: string;
  category_explanation: string;
  first_aid_advice: string;
  result_json: Record<string, any>;
  requires_doctor_review?: boolean;
  doctor_id?: string;
}) {
  try {
    const { data: record, error } = await supabase
      .from('triageai_records')
      .insert([
        {
          patient_id: data.patient_id,
          triage_id: data.triage_id,
          complaint: data.complaint,
          extracted_symptoms: data.extracted_symptoms,
          primary_category: data.primary_category,
          urgency_level: data.urgency_level,
          urgency_score: data.urgency_score,
          category_confidence: data.category_confidence,
          summary: data.summary,
          category_explanation: data.category_explanation,
          first_aid_advice: data.first_aid_advice,
          result_json: data.result_json,
          requires_doctor_review: data.requires_doctor_review || false,
          doctor_id: data.doctor_id,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating triage record:', error);
      return null;
    }

    return record;
  } catch (err) {
    console.error('Exception creating triage record:', err);
    return null;
  }
}

export async function getTriageRecord(triageId: string) {
  try {
    const { data: record, error } = await supabase
      .from('triageai_records')
      .select('*')
      .eq('triage_id', triageId)
      .single();

    if (error) {
      console.error('Error getting triage record:', error);
      return null;
    }

    return record;
  } catch (err) {
    console.error('Exception getting triage record:', err);
    return null;
  }
}

export async function getPatientTriageRecords(
  patientId: string,
  limit = 10
) {
  try {
    const { data: records, error } = await supabase
      .from('triageai_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting triage records:', error);
      return [];
    }

    return records || [];
  } catch (err) {
    console.error('Exception getting triage records:', err);
    return [];
  }
}

export async function updateTriageRecord(
  triageId: string,
  updates: Record<string, any>
) {
  try {
    const { data: record, error } = await supabase
      .from('triageai_records')
      .update(updates)
      .eq('triage_id', triageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating triage record:', error);
      return null;
    }

    return record;
  } catch (err) {
    console.error('Exception updating triage record:', err);
    return null;
  }
}

// ============ DOCTOR NOTES ============

export async function createDoctorNote(data: {
  record_id: string;
  doctor_id: string;
  diagnosis: string;
  recommendation: string;
  follow_up_date?: string;
  follow_up_instructions?: string;
  severity_assessment?: string;
  notes?: string;
}) {
  try {
    const { data: note, error } = await supabase
      .from('triageai_doctor_notes')
      .insert([
        {
          record_id: data.record_id,
          doctor_id: data.doctor_id,
          diagnosis: data.diagnosis,
          recommendation: data.recommendation,
          follow_up_date: data.follow_up_date,
          follow_up_instructions: data.follow_up_instructions,
          severity_assessment: data.severity_assessment,
          notes: data.notes,
          status: 'completed',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating doctor note:', error);
      return null;
    }

    return note;
  } catch (err) {
    console.error('Exception creating doctor note:', err);
    return null;
  }
}

export async function getDoctorNotes(recordId: string) {
  try {
    const { data: notes, error } = await supabase
      .from('triageai_doctor_notes')
      .select('*')
      .eq('record_id', recordId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting doctor notes:', error);
      return [];
    }

    return notes || [];
  } catch (err) {
    console.error('Exception getting doctor notes:', err);
    return [];
  }
}

// ============ NOTIFICATIONS ============

export async function getNotifications(userId: string) {
  try {
    const { data: notifications, error } = await supabase
      .from('triageai_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error getting notifications:', error);
      return [];
    }

    return notifications || [];
  } catch (err) {
    console.error('Exception getting notifications:', err);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data: notification, error } = await supabase
      .from('triageai_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      return null;
    }

    return notification;
  } catch (err) {
    console.error('Exception marking notification as read:', err);
    return null;
  }
}

// ============ REAL-TIME SUBSCRIPTIONS ============
// Real-time subscriptions use the new Supabase Realtime API
// Implementation: Use supabase.channel() for modern realtime features
// See: https://supabase.com/docs/guides/realtime

// ============ HELPER FUNCTIONS ============

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'Red':
      return 'red';
    case 'Yellow':
      return 'yellow';
    case 'Green':
      return 'green';
    default:
      return 'gray';
  }
}

export function getUrgencyLabel(urgency: string): string {
  switch (urgency) {
    case 'Red':
      return '🚨 Darurat';
    case 'Yellow':
      return '⚠️ Mendesak';
    case 'Green':
      return '✅ Tidak Darurat';
    default:
      return 'Tidak Diketahui';
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function deleteTriageRecord(triageId: string) {
  try {
    const { error } = await supabase
      .from('triageai_records')
      .delete()
      .eq('triage_id', triageId);

    if (error) {
      console.error('Error deleting triage record:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception deleting triage record:', err);
    return false;
  }
}
