import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      
      signIn: async (email, password) => {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            set({ 
              user: {
                id: data.user.id,
                email: data.user.email || '',
                created_at: data.user.created_at || new Date().toISOString(),
              } 
            });
          }
        } catch (error) {
          console.error('Error signing in:', error);
          throw error;
        }
      },
      
      signUp: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (error) throw error;
          
          // If email confirmation is disabled, user is immediately signed in
          if (data.user) {
            set({ 
              user: {
                id: data.user.id,
                email: data.user.email || '',
                created_at: data.user.created_at || new Date().toISOString(),
              } 
            });
          }
        } catch (error) {
          console.error('Error signing up:', error);
          throw error;
        }
      },
      
      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null });
          // Clear local storage to prevent refresh token issues
          localStorage.removeItem('auth-storage');
        } catch (error) {
          console.error('Error signing out:', error);
        }
      },
      
      getUser: async () => {
        try {
          set({ loading: true });
          
          // First try to get the user from the current session
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            set({ user: null, loading: false });
            return;
          }
          
          if (sessionData?.session) {
            const { data } = await supabase.auth.getUser();
            
            if (data.user) {
              set({ 
                user: {
                  id: data.user.id,
                  email: data.user.email || '',
                  created_at: data.user.created_at || new Date().toISOString(),
                },
                loading: false
              });
              return;
            }
          }
          
          // If no session, clear the user
          set({ user: null, loading: false });
        } catch (error) {
          console.error('Error getting user:', error);
          set({ user: null, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);