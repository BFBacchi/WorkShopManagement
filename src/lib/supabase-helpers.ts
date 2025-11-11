import { supabase } from './supabase';
import { useAuthStore } from '@/store/auth-store';

/**
 * Intenta ejecutar una consulta con reintentos automáticos en caso de error de conexión
 */
export async function withRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // Verificar si es un error de conexión o de autenticación
      const isConnectionError = 
        error?.message?.includes('fetch') ||
        error?.message?.includes('network') ||
        error?.message?.includes('Failed to fetch') ||
        error?.code === 'PGRST301' ||
        error?.code === 'PGRST302';
      
      const isAuthError = 
        error?.code === 'PGRST301' ||
        error?.message?.includes('JWT') ||
        error?.message?.includes('token');
      
      // Si es un error de autenticación, intentar refrescar la sesión
      if (isAuthError && attempt < maxRetries) {
        console.log('Auth error detected, attempting to refresh session...');
        try {
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && session) {
            // Esperar un poco antes de reintentar
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } catch (refreshErr) {
          console.error('Error refreshing session:', refreshErr);
        }
      }
      
      // Si es un error de conexión y aún tenemos reintentos, esperar y reintentar
      if (isConnectionError && attempt < maxRetries) {
        console.log(`Connection error, retrying... (${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        continue;
      }
      
      // Si no es un error recuperable o se agotaron los reintentos, lanzar el error
      throw error;
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Verifica si hay una sesión activa antes de ejecutar una consulta
 */
export async function ensureSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      // Intentar refrescar
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      
      if (refreshError || !refreshedSession) {
        console.warn('Could not refresh session');
        useAuthStore.getState().logout();
        return false;
      }
      return true;
    }
    
    if (!session) {
      console.warn('No active session');
      useAuthStore.getState().logout();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring session:', error);
    return false;
  }
}

/**
 * Ejecuta una consulta con verificación de sesión y reintentos
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  options?: { maxRetries?: number; delay?: number; requireAuth?: boolean }
): Promise<T> {
  const { maxRetries = 3, delay = 1000, requireAuth = true } = options || {};
  
  if (requireAuth) {
    const hasSession = await ensureSession();
    if (!hasSession) {
      throw new Error('No active session');
    }
  }
  
  return withRetry(queryFn, maxRetries, delay);
}

