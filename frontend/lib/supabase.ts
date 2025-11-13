import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  },
};
