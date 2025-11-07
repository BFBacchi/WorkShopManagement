// Utility functions for image uploads

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';

/**
 * Upload image to Supabase Storage
 * @param file - File to upload
 * @param folder - Folder path in storage (default: 'products')
 * @returns Public URL of uploaded image
 */
export async function uploadImageToSupabase(
  file: File,
  folder: string = 'products'
): Promise<string> {
  const user = useAuthStore.getState().user;
  if (!user?.uid) {
    throw new Error('Usuario no autenticado');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.uid}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Upload file
  const { error: uploadError, data } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error al subir imagen: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new Error('No se pudo obtener la URL pública de la imagen');
  }

  return urlData.publicUrl;
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns true if valid, throws error if invalid
 */
export function validateImageFile(file: File): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Use JPG, PNG, WEBP o GIF');
  }

  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Máximo 5MB');
  }

  return true;
}

/**
 * Create local preview URL from file
 * @param file - File to create preview for
 * @returns Object URL for preview
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to free memory
 * @param url - Preview URL to revoke
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

