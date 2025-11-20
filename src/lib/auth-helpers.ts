import { useAuthStore, UserRole } from '@/store/auth-store';

/**
 * Verifica si el usuario actual es administrador o gerente
 * @returns true si el usuario es admin o manager, false en caso contrario
 */
export function isAdminOrManager(): boolean {
  const { user } = useAuthStore.getState();
  return user?.role === 'admin' || user?.role === 'manager';
}

/**
 * Verifica si el usuario actual es administrador
 * @returns true si el usuario es admin, false en caso contrario
 */
export function isAdmin(): boolean {
  const { user } = useAuthStore.getState();
  return user?.role === 'admin';
}

/**
 * Verifica si el usuario actual es gerente
 * @returns true si el usuario es manager, false en caso contrario
 */
export function isManager(): boolean {
  const { user } = useAuthStore.getState();
  return user?.role === 'manager';
}

/**
 * Obtiene el ID del usuario actual
 * @returns el uid del usuario o null si no está autenticado
 */
export function getCurrentUserId(): string | null {
  const { user } = useAuthStore.getState();
  return user?.uid || null;
}

/**
 * Verifica si el usuario tiene un rol específico
 * @param role El rol a verificar
 * @returns true si el usuario tiene ese rol, false en caso contrario
 */
export function hasRole(role: UserRole): boolean {
  const { user } = useAuthStore.getState();
  return user?.role === role;
}


