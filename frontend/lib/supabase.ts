import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client with fallback for build time
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else if (typeof window !== 'undefined') {
  // Only throw error in browser, not during SSR/build
  throw new Error(
    'Missing Supabase environment variables. Please check your environment configuration.'
  );
}

export const getSupabaseClient = () => {
  if (!supabase && typeof window !== 'undefined') {
    throw new Error('Supabase is not properly initialized. Missing environment variables.');
  }
  return supabase;
};

// Default export for backward compatibility
export { supabase };

// Auth helpers
export const authService = {
  // Sign up
  async signUp(email: string, password: string, userRole: 'patient' | 'doctor' | 'admin') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: userRole,
        },
      },
    });
    return { data, error };
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // Get session
  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  // On auth state change
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event: any, session: any) => {
      callback(session?.user || null);
    });
  },
};

// Database Types
export interface Patient {
  id: string
  user_id: string
  nik: string
  full_name: string
  phone?: string
  date_of_birth?: string
  gender?: string
  bpjs_number?: string
  address?: string
  status?: string
  last_visit?: string
  created_at: string
  updated_at: string
}

export interface TriageRecord {
  id: string
  patient_id: string
  triage_id: string
  complaint: string
  urgency_level: 'Green' | 'Yellow' | 'Red'
  urgency_score: number
  primary_category: string
  category_confidence: string
  extracted_symptoms: string[]
  detected_flags: any[]
  numeric_data: any
  summary: string
  category_explanation?: string
  first_aid_advice?: string
  result_json: any
  requires_doctor_review: boolean
  doctor_reviewed: boolean
  doctor_note_id?: string
  created_at: string
}

export interface DoctorNote {
  id: string
  triage_id: string
  doctor_id: string
  doctor_name: string
  diagnosis?: string
  notes?: string
  prescription?: string
  follow_up_needed: boolean
  follow_up_date?: string
  status: 'pending' | 'reviewed' | 'completed'
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  patient_id?: string
  doctor_id?: string
  triage_id?: string
  type: 'red_case' | 'doctor_note' | 'follow_up' | 'general'
  title: string
  message: string
  read: boolean
  created_at: string
}

// Database Service
export const dbService = {
  // Patient operations
  async createPatient(patient: Partial<Patient>) {
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single()
    return { data, error }
  },

  async getPatient(userId: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async updatePatient(userId: string, updates: Partial<Patient>) {
    const { data, error } = await supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Triage record operations
  async createTriageRecord(record: Partial<TriageRecord>) {
    const { data, error } = await supabase
      .from('triage_records')
      .insert([record])
      .select()
      .single()
    return { data, error }
  },

  async getTriageRecords(patientId: string, limit = 10) {
    const { data, error } = await supabase
      .from('triage_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async getTriageRecordById(id: string) {
    const { data, error } = await supabase
      .from('triage_records')
      .select('*, doctor_notes(*)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async getUnreviewedTriages(urgencyLevel?: string) {
    let query = supabase
      .from('triage_records')
      .select('*, patients(full_name, phone)')
      .eq('doctor_reviewed', false)
      .order('created_at', { ascending: false })

    if (urgencyLevel) {
      query = query.eq('urgency_level', urgencyLevel)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Doctor note operations
  async createDoctorNote(note: Partial<DoctorNote>) {
    const { data, error } = await supabase
      .from('doctor_notes')
      .insert([note])
      .select()
      .single()

    // Update triage record as reviewed
    if (!error && note.triage_id) {
      await supabase
        .from('triage_records')
        .update({ doctor_reviewed: true, doctor_note_id: data.id })
        .eq('id', note.triage_id)
    }

    return { data, error }
  },

  async updateDoctorNote(id: string, updates: Partial<DoctorNote>) {
    const { data, error } = await supabase
      .from('doctor_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async getDoctorNote(triageId: string) {
    const { data, error } = await supabase
      .from('doctor_notes')
      .select('*')
      .eq('triage_id', triageId)
      .single()
    return { data, error }
  },

  // Notification operations
  async createNotification(notification: Partial<Notification>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single()
    return { data, error }
  },

  async getNotifications(userId: string, userType: 'patient' | 'doctor') {
    const column = userType === 'patient' ? 'patient_id' : 'doctor_id'
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq(column, userId)
      .order('created_at', { ascending: false })
      .limit(20)
    return { data, error }
  },

  async markNotificationAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async getUnreadCount(userId: string, userType: 'patient' | 'doctor') {
    const column = userType === 'patient' ? 'patient_id' : 'doctor_id'
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq(column, userId)
      .eq('read', false)
    return { count, error }
  },
};
