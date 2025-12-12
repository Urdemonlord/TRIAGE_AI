'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, dbService, type Patient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  patient: Patient | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    userRole?: 'patient' | 'doctor',
    additionalData?: { phone?: string; dateOfBirth?: string; gender?: string }
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Patient>) => Promise<{ error: any }>;
  refreshPatient: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch patient data when user is authenticated
  const fetchPatientData = async (userId: string) => {
    try {
      const { data, error } = await dbService.getPatient(userId);
      if (error) {
        // Specific error handling
        if (error.code === 'PGRST116' || error.code === '406') {
          // RLS policy violation or no data found - this is expected for new users
          console.warn('Patient record not found or RLS policy blocked access:', error);
          setPatient(null);
          return;
        }
        console.error('Error fetching patient data:', error);
        return;
      }
      setPatient(data || null);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setPatient(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Check active sessions
    authService.getSession().then((session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPatientData(session.user.id);
      } else {
        // Session expired or invalid - clear any stale data
        setPatient(null);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Session check failed:', err);
      setUser(null);
      setPatient(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          await fetchPatientData(currentUser.id);
        } else {
          setPatient(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userRole: 'patient' | 'doctor' = 'patient',
    additionalData?: { phone?: string; dateOfBirth?: string; gender?: string }
  ) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await authService.signUp(
        email,
        password,
        userRole
      );

      if (authError) {
        return { error: authError };
      }

      // 2. Create patient record (only for patients)
      if (userRole === 'patient' && authData.user) {
        const patientData: any = {
          user_id: authData.user.id,
          email: email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add optional fields if provided
        if (additionalData?.phone) patientData.phone = additionalData.phone;
        if (additionalData?.dateOfBirth) patientData.date_of_birth = additionalData.dateOfBirth;
        if (additionalData?.gender) patientData.gender = additionalData.gender;

        const { error: patientError } = await dbService.createPatient(patientData);

        if (patientError) {
          console.error('Error creating patient record:', patientError);
          return { error: new Error('Gagal membuat data pasien: ' + (patientError.message || 'Unknown error')) };
        }

        // Fetch patient data
        await fetchPatientData(authData.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) {
        return { error };
      }

      // Fetch patient data after successful sign in
      if (data.user) {
        await fetchPatientData(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setPatient(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<Patient>) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const { data, error } = await dbService.updatePatient(user.id, updates);
      if (error) {
        return { error };
      }

      // Update local state
      setPatient(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const refreshPatient = async () => {
    if (user) {
      await fetchPatientData(user.id);
    }
  };

  const value = {
    user,
    patient,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshPatient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route wrapper
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { redirect?: string; allowedRoles?: string[] } = {}
) {
  return function ProtectedRoute(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { redirect = '/auth/login', allowedRoles } = options;

    useEffect(() => {
      if (!loading && !user) {
        router.push(redirect);
      }

      if (!loading && user && allowedRoles) {
        const userRole = user.user_metadata?.role;
        if (!allowedRoles.includes(userRole)) {
          router.push('/unauthorized');
        }
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}
