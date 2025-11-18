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
  refreshUserData: (retries?: number) => Promise<void>;
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
              .maybeSingle();

            // Si hay error pero no es porque la tabla no existe, lanzar el error
            if (employeeError) {
              // Si el error es porque no existe la tabla o el registro, usar fallback
              // PGRST116 = no rows returned, 42P01 = table doesn't exist, 406 = Not Acceptable (usualmente con .single())
              if (employeeError.code === 'PGRST116' || employeeError.code === '42P01' || employeeError.code === 'PGRST406') {
                console.log('Employee table or record not found, using basic auth');
              } else {
                console.error('Error fetching employee data:', employeeError);
                // No lanzar el error, continuar con fallback
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
            const error = employeeError as { code?: string; message?: string; status?: number };
            // PGRST116 = no rows, 42P01 = table doesn't exist, PGRST406 = Not Acceptable
            if (
              error?.code === 'PGRST116' || 
              error?.code === '42P01' || 
              error?.code === 'PGRST406' ||
              error?.status === 406 ||
              error?.message?.includes('relation') || 
              error?.message?.includes('does not exist') ||
              error?.message?.includes('Not Acceptable')
            ) {
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
            
            try {
              switch (event) {
                case 'SIGNED_IN':
                case 'TOKEN_REFRESHED':
                case 'USER_UPDATED':
                  if (session?.user) {
                    try {
                      await get().refreshUserData();
                    } catch (error: any) {
                      console.error('Error refreshing user data on auth change:', error);
                      // No cerrar sesión automáticamente, solo loggear el error
                      // La sesión sigue siendo válida aunque haya error al obtener datos del empleado
                      if (error?.message?.includes('session') || error?.message?.includes('token')) {
                        // Solo cerrar sesión si es un error de sesión/token
                        set({ isAuthenticated: false, user: null, isLoading: false });
                      }
                    }
                  }
                  break;
                
                case 'SIGNED_OUT':
                  set({ isAuthenticated: false, user: null, isLoading: false });
                  break;
                
                case 'PASSWORD_RECOVERY':
                  // No action needed
                  break;
                  
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error);
              // No hacer nada, solo loggear el error para no romper la aplicación
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
        // Nota: Supabase maneja el refresh automático de tokens, así que solo verificamos si la sesión sigue activa
        sessionCheckInterval = setInterval(async () => {
          try {
            // Solo verificar si el usuario está autenticado según nuestro estado
            if (!get().isAuthenticated) {
              return; // No hacer nada si ya no está autenticado
            }

            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error checking session in interval:', error);
              // Intentar refrescar solo si es un error de token/sesión
              if (error.message?.includes('token') || error.message?.includes('session') || error.message?.includes('JWT')) {
                try {
                  const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
                  if (refreshError || !refreshedSession) {
                    console.warn('Could not refresh session in interval, logging out');
                    set({ isAuthenticated: false, user: null });
                  } else {
                    // Sesión refrescada exitosamente, pero no refrescar datos del usuario para evitar loops
                    console.log('Session refreshed successfully in interval');
                  }
                } catch (refreshErr) {
                  console.error('Error refreshing session in interval:', refreshErr);
                  // Solo cerrar sesión si es un error crítico
                  if (refreshErr instanceof Error && (
                    refreshErr.message?.includes('token') || 
                    refreshErr.message?.includes('expired')
                  )) {
                    set({ isAuthenticated: false, user: null });
                  }
                }
              }
              return;
            }

            // Si no hay sesión pero nuestro estado dice que está autenticado, cerrar sesión
            if (!session && get().isAuthenticated) {
              console.warn('Session expired in interval, logging out');
              set({ isAuthenticated: false, user: null });
            }
            // No hacer nada si hay sesión y está autenticado - Supabase maneja el refresh automático
          } catch (error) {
            console.error('Error in periodic session check:', error);
            // No cerrar sesión por errores inesperados, solo loggear
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
