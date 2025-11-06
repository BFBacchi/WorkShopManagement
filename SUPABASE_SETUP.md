# Configuración de Supabase

Este proyecto utiliza Supabase como backend. Sigue estos pasos para configurar tu base de datos:

## 1. Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración (puede tomar unos minutos)

## 2. Configurar las variables de entorno

1. En tu proyecto Supabase, ve a **Settings** → **API**
2. Copia la **URL** y la **anon/public key**
3. Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

**Ejemplo:**
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNTk2ODAwMCwiZXhwIjoxOTUxNTQ0MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 3. Crear las tablas en Supabase

1. En tu proyecto Supabase, ve a **SQL Editor**
2. Copia y pega el contenido completo del archivo `supabase-schema.sql`
3. Haz clic en **Run** o presiona `Ctrl+Enter` (o `Cmd+Enter` en Mac)
4. Deberías ver un mensaje de éxito

## 4. Verificar las tablas

1. Ve a **Table Editor** en Supabase
2. Deberías ver las siguientes tablas:
   - `products`
   - `sales`
   - `customers`
   - `repair_orders`

## 5. Configurar autenticación OTP (código de 6 dígitos)

**⚠️ IMPORTANTE**: Para que el sistema funcione con códigos OTP de 6 dígitos en lugar de magic links, debes configurar las plantillas de email en Supabase.

### Pasos para configurar OTP:

1. Ve a **Authentication** → **Email Templates** en tu proyecto Supabase

2. Encuentra el template **"Magic Link"** o **"Confirm signup"**

3. **Edita el Subject** del email para que diga algo como:
   ```
   Tu código de verificación es: {{ .Token }}
   ```

4. **Edita el Body** del email para incluir el código:
   ```html
   <h2>Código de verificación</h2>
   <p>Tu código de verificación es: <strong>{{ .Token }}</strong></p>
   <p>Este código expira en 1 hora.</p>
   ```

5. **Guarda los cambios**

6. También puedes editar el template **"Change Email Address"** si usas verificación de email:
   - Usa la misma estructura con `{{ .Token }}` para mostrar el código

### Nota sobre Magic Links:

Si ves que aún se envía un link en lugar del código, verifica que:
- El template use `{{ .Token }}` (no `{{ .ConfirmationURL }}`)
- El código en `auth-store.ts` esté configurado correctamente (ya está hecho)
- Prueba enviando un nuevo código después de guardar los cambios en el template

## 6. Instalar dependencias y ejecutar

```bash
npm install
npm run dev
```

## Notas importantes

- **Row Level Security (RLS)**: Está habilitado por defecto. Los usuarios solo pueden acceder a sus propios datos.
- **Autenticación**: El sistema usa OTP por email. Asegúrate de configurar correctamente los emails en Supabase.
- **Variables de entorno**: Nunca commits el archivo `.env` a tu repositorio. El archivo `.env.example` muestra las variables necesarias.

## Estructura de la base de datos

- **products**: Productos para inventario y POS
- **sales**: Ventas realizadas en el POS
- **customers**: Clientes del taller
- **repair_orders**: Órdenes de reparación

Todas las tablas tienen un campo `user_id` que se usa para filtrar los datos por usuario autenticado.

