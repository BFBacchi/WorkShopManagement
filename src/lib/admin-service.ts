import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cliente de Supabase con permisos de administrador
 * ⚠️ ADVERTENCIA: Este cliente usa la service role key y debe usarse SOLO en el servidor.
 * En producción, deberías usar Edge Functions de Supabase en lugar de esto.
 */
let adminClient: ReturnType<typeof createClient> | null = null;

function getAdminClient() {
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL no está configurada');
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'VITE_SUPABASE_SERVICE_ROLE_KEY no está configurada. ' +
      'Ve a Supabase Dashboard → Settings → API y copia la "service_role" key. ' +
      '⚠️ IMPORTANTE: Esta key solo debe usarse en Edge Functions en producción.'
    );
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

/**
 * Crea un nuevo usuario en Supabase Auth con permisos de administrador
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @param emailConfirm Si el email debe estar confirmado automáticamente
 * @returns Datos del usuario creado
 */
export async function createAdminUser(
  email: string,
  password: string,
  emailConfirm: boolean = true
) {
  const admin = getAdminClient();
  
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: emailConfirm,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('No se pudo crear el usuario');
  }

  return data.user;
}

/**
 * Actualiza la contraseña de un usuario
 * @param userId ID del usuario
 * @param newPassword Nueva contraseña
 */
export async function updateUserPassword(userId: string, newPassword: string) {
  const admin = getAdminClient();
  
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}



