# Configuración del Servicio de Administración

## ⚠️ IMPORTANTE: Seguridad

Este servicio usa la **Service Role Key** de Supabase para crear usuarios. Esta key tiene permisos completos de administrador y **NUNCA debe exponerse públicamente**.

### ⚠️ ADVERTENCIA DE SEGURIDAD

**En producción, deberías usar Edge Functions de Supabase** en lugar de exponer la service role key en el frontend. Esta solución es temporal y solo para desarrollo/testing.

## Configuración

### 1. Obtener la Service Role Key

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** → **API**
3. Busca la sección **Project API keys**
4. Copia la **`service_role`** key (NO la `anon` key)
5. ⚠️ **NUNCA compartas esta key públicamente**

### 2. Agregar la Variable de Entorno

Crea o actualiza tu archivo `.env` en la raíz del proyecto:

```env
# Variables existentes
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key

# Nueva variable (SOLO para desarrollo)
VITE_SUPABASE_SERVICE_ROLE_KEY=aslkdjasdlfjkhadsrfsfsdf
```

**Ejemplo:**
```env
VITE_SUPABASE_URL=https://tttwyndeubrzsccxkabg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Verificar que el archivo `.env` esté en `.gitignore`

Asegúrate de que `.env` esté en tu `.gitignore` para que **NUNCA** se suba al repositorio:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

## Uso

Una vez configurado, el módulo de Backoffice podrá crear empleados sin necesidad de confirmación de email.

## Migración a Edge Functions (Recomendado para Producción)

Para producción, deberías crear una Edge Function de Supabase:

1. Instalar Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Inicializar funciones:
   ```bash
   supabase functions new create-employee
   ```

3. Crear la función que use la service role key (que estará disponible automáticamente en Edge Functions)

4. Llamar a la función desde el frontend usando `supabase.functions.invoke()`

## Solución Temporal Actual

La solución actual funciona pero expone la service role key en el frontend. Esto es aceptable para:
- ✅ Desarrollo local
- ✅ Testing
- ✅ Prototipos

**NO es recomendable para:**
- ❌ Producción pública
- ❌ Aplicaciones con muchos usuarios
- ❌ Aplicaciones que manejan datos sensibles

## Verificación

Para verificar que funciona:

1. Asegúrate de tener la variable `VITE_SUPABASE_SERVICE_ROLE_KEY` en tu `.env`
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Intenta crear un empleado desde el módulo de Backoffice
4. Debería funcionar sin errores de permisos



