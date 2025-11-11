import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'manager' | 'employee' | 'technician';

interface User {
  uid: string;
  email: string;
  name?: string;
  role?: UserRole;
  branchId?: string | null;
  branchName?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user) {
            await get().refreshUserData();
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      refreshUserData: async () => {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          if (!session?.user) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          // Intentar obtener información del empleado si existe la tabla
          try {
            const { data: employee, error: employeeError } = await supabase
              .from('employees')
              .select(`
                id,
                email,
                full_name,
                role,
                branch_id,
                status,
                branches (
                  id,
                  name
                )
              `)
              .eq('id', session.user.id)
              .single();

            // Si hay error pero no es porque la tabla no existe, lanzar el error
            if (employeeError) {
              // Si el error es porque no existe la tabla o el registro, usar fallback
              if (employeeError.code === 'PGRST116' || employeeError.code === '42P01') {
                console.log('Employee table or record not found, using basic auth');
              } else {
                throw employeeError;
              }
            } else if (employee && employee.status === 'active') {
              const branchesData = employee.branches as { id: string; name: string } | { id: string; name: string }[] | null;
              const branchName = Array.isArray(branchesData) 
                ? branchesData[0]?.name 
                : branchesData?.name;

              const user: User = {
                uid: employee.id,
                email: employee.email,
                name: employee.full_name,
                role: employee.role as UserRole,
                branchId: employee.branch_id,
                branchName: branchName,
              };

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          } catch (employeeError: unknown) {
            // Si el error es porque la tabla no existe o el registro no existe, usar fallback
            const error = employeeError as { code?: string; message?: string };
            if (error?.code === 'PGRST116' || error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
              console.log('Employee table or record not found, using basic auth');
            } else {
              console.error('Error fetching employee data:', employeeError);
              // Continuar con fallback en lugar de fallar completamente
            }
          }

          // Fallback: usar datos básicos de auth
          const user: User = {
            uid: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error in refreshUserData:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
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
        try {
          await get().refreshUserData();
        } catch (error) {
          console.error('Error checking auth:', error);
          set({ isAuthenticated: false, user: null, isLoading: false });
        }
      },

      initializeAuth: async () => {
        // Establecer loading al inicio
        set({ isLoading: true });

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            try {
              await get().refreshUserData();
            } catch (error) {
              console.error('Error refreshing user data on auth change:', error);
              set({ isAuthenticated: false, user: null, isLoading: false });
            }
          } else {
            set({ isAuthenticated: false, user: null, isLoading: false });
          }
        });

        // Check initial session
        try {
          await get().checkAuth();
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ isAuthenticated: false, user: null, isLoading: false });
        }
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
