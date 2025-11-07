# Configuración de Supabase Storage para Imágenes

Para que la funcionalidad de carga de imágenes funcione correctamente, necesitas configurar un bucket en Supabase Storage.

## Pasos para Configurar

### 1. Crear el Bucket en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **Storage** en el menú lateral
3. Haz clic en **New bucket**
4. Configura el bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Marcar como público** (para que las imágenes sean accesibles)
   - **File size limit**: 5242880 (5MB) o el límite que prefieras
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp,image/gif`
5. Haz clic en **Create bucket**

### 2. Configurar Políticas de Seguridad (RLS)

Después de crear el bucket, necesitas configurar las políticas para que los usuarios puedan subir y leer sus propias imágenes:

1. En la página del bucket `product-images`, ve a la pestaña **Policies**
2. Haz clic en **New Policy**
3. Crea las siguientes políticas:

#### Política 1: Permitir lectura pública
- **Policy name**: `Public read access`
- **Allowed operation**: `SELECT`
- **Policy definition**: 
```sql
true
```

#### Política 2: Permitir subida de archivos a usuarios autenticados
- **Policy name**: `Authenticated users can upload`
- **Allowed operation**: `INSERT`
- **Policy definition**:
```sql
bucket_id = 'product-images' AND auth.role() = 'authenticated'
```

#### Política 3: Permitir actualización de archivos propios
- **Policy name**: `Users can update own files`
- **Allowed operation**: `UPDATE`
- **Policy definition**:
```sql
bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

#### Política 4: Permitir eliminación de archivos propios
- **Policy name**: `Users can delete own files`
- **Allowed operation**: `DELETE`
- **Policy definition**:
```sql
bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### 3. Verificar la Configuración

Una vez configurado, deberías poder:
- ✅ Subir imágenes desde el formulario de productos
- ✅ Ver las imágenes en el catálogo
- ✅ Acceder a las imágenes mediante URL pública

## Estructura de Archivos

Las imágenes se almacenan con la siguiente estructura:
```
product-images/
  └── {user_id}/
      └── {timestamp}-{random}.{ext}
```

Esto asegura que cada usuario tenga sus propias imágenes organizadas por carpeta.

## Notas Importantes

- **Límite de tamaño**: Por defecto está configurado para 5MB por archivo
- **Formatos soportados**: JPG, PNG, WEBP, GIF
- **URLs públicas**: Las imágenes son accesibles públicamente mediante la URL generada por Supabase
- **Seguridad**: Solo usuarios autenticados pueden subir imágenes, pero las imágenes son públicas una vez subidas

## Solución de Problemas

### Error: "Bucket not found"
- Verifica que el bucket se llame exactamente `product-images`
- Asegúrate de que el bucket esté marcado como público

### Error: "New row violates row-level security policy"
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de estar autenticado al intentar subir

### Error: "File size exceeds limit"
- Verifica el límite de tamaño del bucket
- Reduce el tamaño de la imagen antes de subirla

