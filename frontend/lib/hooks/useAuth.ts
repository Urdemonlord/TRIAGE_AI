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

  const signUp = async (email: string, password: string, fullName: string, role: 'patient' | 'doctor') => {
    try {
      setError(null);
      const { data, error } = await authService.signUp(email, password, role);
      if (error) throw error;
      
      // Create patient record if patient role
      if (role === 'patient' && data.user) {
        const { dbService } = await import('@/lib/supabase');
        const { error: patientError } = await dbService.createPatient({
          user_id: data.user.id,
          full_name: fullName,
          nik: '', // Will be updated in profile
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (patientError) throw patientError;
      }
      
      return data;
    } catch (err: any) {
      setError(err.message);
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
