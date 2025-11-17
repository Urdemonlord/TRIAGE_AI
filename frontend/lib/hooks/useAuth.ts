'use client';

import { useEffect, useState } from 'react';
import { authService } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: authListener } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: 'patient' | 'doctor',
    additionalData?: { phone?: string; dateOfBirth?: string; gender?: string }
  ) => {
    try {
      setError(null);
      const { data, error } = await authService.signUp(email, password, role);
      if (error) {
        console.error('Auth signup error:', error);
        throw error;
      }
      
      // Create patient record if patient role
      if (role === 'patient' && data.user) {
        const { dbService } = await import('@/lib/supabase');
        console.log('Creating patient for user:', data.user.id, 'with fullName:', fullName);
        
        const patientData: any = {
          user_id: data.user.id,
          full_name: fullName,
          nik: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add optional fields if provided
        if (additionalData?.phone) patientData.phone = additionalData.phone;
        if (additionalData?.dateOfBirth) patientData.date_of_birth = additionalData.dateOfBirth;
        if (additionalData?.gender) patientData.gender = additionalData.gender;

        const { error: patientError } = await dbService.createPatient(patientData);
        if (patientError) {
          console.error('Patient creation error:', patientError);
          throw new Error('Gagal membuat data pasien: ' + (patientError.message || 'Unknown error'));
        }
        console.log('Patient record created successfully');
      }
      
      return data;
    } catch (err: any) {
      console.error('SignUp error:', err);
      setError(err.message || 'Signup failed');
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await authService.signIn(email, password);
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await authService.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
