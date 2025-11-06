import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface User {
  uid: string;
  email: string;
  name?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      sendOTP: async (email: string) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: true,
              // Force OTP code instead of magic link
              emailRedirectTo: undefined,
            },
          });
          if (error) throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOTP: async (email: string, code: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'email',
          });
          
          if (error) throw error;
          
          if (data.user) {
            const user: User = {
              uid: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            };
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user: User = {
            uid: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          };
          set({
            user,
            isAuthenticated: true,
          });
        } else {
          set({ isAuthenticated: false, user: null });
        }
      },

      initializeAuth: async () => {
        // Listen for auth state changes
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const user: User = {
              uid: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            };
            set({
              user,
              isAuthenticated: true,
            });
          } else {
            set({ isAuthenticated: false, user: null });
          }
        });

        // Check initial session
        await get().checkAuth();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
