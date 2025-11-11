import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'manager' | 'employee' | 'technician';

// Variables globales para manejar la limpieza de suscripciones
let authSubscription: { unsubscribe: () => void } | null = null;
let sessionCheckInterval: NodeJS.Timeout | null = null;

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

      refreshUserData: async (retries = 3) => {
        try {
          // Intentar refrescar la sesión si es necesario
          let { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          // Si hay error, intentar refrescar la sesión
          if (sessionError && retries > 0) {
            console.log('Session error, attempting to refresh...', sessionError);
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshData.session) {
              session = refreshData.session;
              sessionError = null;
            }
          }
          
          if (sessionError) {
            console.error('Error getting session:', sessionError);
            // Si aún hay error y tenemos reintentos, intentar de nuevo
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              return get().refreshUserData(retries - 1);
            }
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
        // Limpiar suscripciones anteriores si existen
        if (authSubscription) {
          authSubscription.unsubscribe();
          authSubscription = null;
        }
        if (sessionCheckInterval) {
          clearInterval(sessionCheckInterval);
          sessionCheckInterval = null;
        }

        // Establecer loading al inicio
        set({ isLoading: true });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            switch (event) {
              case 'SIGNED_IN':
              case 'TOKEN_REFRESHED':
              case 'USER_UPDATED':
                if (session?.user) {
                  try {
                    await get().refreshUserData();
                  } catch (error) {
                    console.error('Error refreshing user data on auth change:', error);
                    set({ isAuthenticated: false, user: null, isLoading: false });
                  }
                }
                break;
              
              case 'SIGNED_OUT':
              case 'USER_DELETED':
                set({ isAuthenticated: false, user: null, isLoading: false });
                break;
              
              case 'PASSWORD_RECOVERY':
                // No action needed
                break;
            }
          }
        );
        authSubscription = subscription;

        // Verificar sesión inicial
        try {
          await get().checkAuth();
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ isAuthenticated: false, user: null, isLoading: false });
        }

        // Verificación periódica de sesión cada 5 minutos
        sessionCheckInterval = setInterval(async () => {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error checking session:', error);
              // Si hay error, intentar refrescar
              try {
                const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError || !refreshedSession) {
                  console.warn('Could not refresh session, logging out');
                  set({ isAuthenticated: false, user: null });
                } else {
                  // Sesión refrescada exitosamente
                  await get().refreshUserData();
                }
              } catch (refreshErr) {
                console.error('Error refreshing session:', refreshErr);
                set({ isAuthenticated: false, user: null });
              }
              return;
            }

            if (!session && get().isAuthenticated) {
              // Sesión expirada pero el estado dice que está autenticado
              console.warn('Session expired, logging out');
              set({ isAuthenticated: false, user: null });
            } else if (session && !get().isAuthenticated) {
              // Hay sesión pero el estado dice que no está autenticado
              console.log('Session found, refreshing user data');
              await get().refreshUserData();
            }
          } catch (error) {
            console.error('Error in periodic session check:', error);
          }
        }, 5 * 60 * 1000); // Cada 5 minutos
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
