import { supabase } from './supabase';

// Types based on ERD
export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  gender: string;
  dob: string;
  phone: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  name: string;
  specialization: string;
  license_no: string;
  created_at: string;
}

export interface TriageSession {
  id: string;
  patient_id: string;
  doctor_id?: string;
  complaint: string;
  symptoms: string[];
  categories: string[];
  urgency: string;
  risk_score: number;
  recommendation: string;
  summary: string;
  status: 'pending' | 'reviewed' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface TriageNote {
  id: string;
  session_id: string;
  doctor_id: string;
  note: string;
  decision: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  entity: string;
  action: string;
  before: Record<string, any>;
  after: Record<string, any>;
  created_at: string;
}

// Patient operations
export const patientService = {
  // Create patient profile
  async createProfile(userId: string, data: Omit<Patient, 'id' | 'user_id' | 'created_at'>) {
    const { data: result, error } = await supabase
      .from('patients')
      .insert([
        {
          user_id: userId,
          ...data,
        },
      ])
      .select()
      .single();

    return { data: result, error };
  },

  // Get patient profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Update patient profile
  async updateProfile(userId: string, updates: Partial<Patient>) {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },
};

// Doctor operations
export const doctorService = {
  // Create doctor profile
  async createProfile(userId: string, data: Omit<Doctor, 'id' | 'user_id' | 'created_at'>) {
    const { data: result, error } = await supabase
      .from('doctors')
      .insert([
        {
          user_id: userId,
          ...data,
        },
      ])
      .select()
      .single();

    return { data: result, error };
  },

  // Get doctor profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // List all doctors
  async listDoctors() {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Update doctor profile
  async updateProfile(userId: string, updates: Partial<Doctor>) {
    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },
};

// Triage session operations
export const triageSessionService = {
  // Create triage session
  async create(data: Omit<TriageSession, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('triage_sessions')
      .insert([data])
      .select()
      .single();

    return { data: result, error };
  },

  // Get triage session
  async getById(sessionId: string) {
    const { data, error } = await supabase
      .from('triage_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    return { data, error };
  },

  // Get patient's triage sessions
  async getByPatientId(patientId: string) {
    const { data, error } = await supabase
      .from('triage_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get pending sessions for doctors
  async getPendingSessions() {
    const { data, error } = await supabase
      .from('triage_sessions')
      .select('*, patients(name), patients_data:patients(dob, gender)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    return { data, error };
  },

  // Update triage session
  async update(sessionId: string, updates: Partial<TriageSession>) {
    const { data, error } = await supabase
      .from('triage_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    return { data, error };
  },

  // Assign doctor to session
  async assignDoctor(sessionId: string, doctorId: string) {
    const { data, error } = await supabase
      .from('triage_sessions')
      .update({ doctor_id: doctorId, status: 'reviewed' })
      .eq('id', sessionId)
      .select()
      .single();

    return { data, error };
  },
};

// Triage note operations
export const triageNoteService = {
  // Create note
  async create(data: Omit<TriageNote, 'id' | 'created_at'>) {
    const { data: result, error } = await supabase
      .from('triage_notes')
      .insert([data])
      .select()
      .single();

    return { data: result, error };
  },

  // Get notes for session
  async getBySessionId(sessionId: string) {
    const { data, error } = await supabase
      .from('triage_notes')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    return { data, error };
  },

  // Update note
  async update(noteId: string, updates: Partial<TriageNote>) {
    const { data, error } = await supabase
      .from('triage_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();

    return { data, error };
  },
};

// Audit log operations
export const auditLogService = {
  // Create audit log
  async log(data: Omit<AuditLog, 'id' | 'created_at'>) {
    const { error } = await supabase
      .from('audit_logs')
      .insert([data]);

    return { error };
  },

  // Get audit logs for user
  async getUserLogs(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('actor_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Get all audit logs (admin only)
  async getAllLogs(limit = 100) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },
};
