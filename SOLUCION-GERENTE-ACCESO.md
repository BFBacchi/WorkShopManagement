# Solución: Permitir acceso a Gerente a la base de datos

## Problema Identificado

El usuario gerente no puede ver el contenido de la base de datos por dos razones:

1. **Políticas RLS en Supabase**: Solo permitían acceso a usuarios con rol 'admin'
2. **Código de la aplicación**: Filtra por `user_id`, mostrando solo datos del usuario actual

## Solución Implementada

### Paso 1: Actualizar Políticas RLS en Supabase (CRÍTICO)

**Ejecuta este script en Supabase SQL Editor:**

```sql
-- Archivo: fix-rls-admin-manager-complete.sql
```

Este script:
- Actualiza la función `is_current_user_admin()` para incluir también el rol 'manager'
- Todas las políticas RLS que usan esta función ahora permitirán acceso a admin y manager

**INSTRUCCIONES:**
1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Copia y pega el contenido completo de `fix-rls-admin-manager-complete.sql`
4. Ejecuta el script
5. Verifica que la función retorna `TRUE` cuando inicias sesión como gerente

### Paso 2: Verificar que Funciona

**Ejecuta este script de diagnóstico (como usuario gerente):**

```sql
-- Archivo: diagnose-manager-access.sql
```

Este script te mostrará:
- Si tu rol es correcto ('manager')
- Si la función retorna TRUE
- Si puedes acceder a las tablas
- Qué políticas RLS están activas

### Paso 3: Actualizar Código de la Aplicación

He creado un helper (`src/lib/auth-helpers.ts`) y actualizado `DashboardPage.tsx` como ejemplo.

**Archivos que necesitan actualización:**

1. ✅ `src/pages/DashboardPage.tsx` - **YA ACTUALIZADO**
2. ⚠️ `src/features/customers/stores/customers-store.ts` - Necesita actualización
3. ⚠️ `src/features/repairs/components/NewOrderDialog.tsx` - Necesita actualización
4. ⚠️ `src/features/settings/stores/settings-store.ts` - Necesita actualización
5. ⚠️ `src/pages/RepairsPage.tsx` - Necesita actualización

**Patrón a seguir:**

```typescript
import { isAdminOrManager } from '@/lib/auth-helpers';

// ANTES:
const { data } = await supabase
  .from('tabla')
  .select('*')
  .eq('user_id', user.uid);

// DESPUÉS:
const query = supabase
  .from('tabla')
  .select('*');

// Solo filtrar por user_id si NO es admin o manager
if (!isAdminOrManager()) {
  query.eq('user_id', user.uid);
}

const { data } = await query;
```

## Verificación Final

Después de ejecutar el script SQL:

1. **Inicia sesión como usuario gerente**
2. **Ejecuta en Supabase SQL Editor:**
   ```sql
   SELECT is_current_user_admin(); -- Debe retornar TRUE
   SELECT COUNT(*) FROM products; -- Debe mostrar todos los productos
   SELECT COUNT(*) FROM customers; -- Debe mostrar todos los clientes
   ```

3. **En la aplicación:**
   - El dashboard debe mostrar todos los datos (no solo los del usuario)
   - Las listas deben mostrar todos los registros

## Archivos Creados

1. `fix-rls-admin-manager-complete.sql` - Script SQL principal
2. `diagnose-manager-access.sql` - Script de diagnóstico
3. `verify-admin-and-manager-access.sql` - Script de verificación
4. `src/lib/auth-helpers.ts` - Helper para verificar roles
5. `SOLUCION-GERENTE-ACCESO.md` - Este documento

## Notas Importantes

- **El script SQL es crítico**: Sin ejecutarlo, el gerente NO podrá acceder a los datos
- **El código TypeScript mejora la experiencia**: Pero las políticas RLS son lo más importante
- **Verifica el rol del usuario**: Asegúrate de que el usuario gerente tenga `role = 'manager'` y `status = 'active'` en la tabla `employees`

## Próximos Pasos

1. ✅ Ejecutar `fix-rls-admin-manager-complete.sql` en Supabase
2. ✅ Verificar con `diagnose-manager-access.sql`
3. ⚠️ Actualizar los demás archivos TypeScript siguiendo el patrón mostrado
4. ✅ Probar la aplicación como usuario gerente

## Soporte

Si después de ejecutar el script SQL sigues teniendo problemas:

1. Verifica que el usuario tiene `role = 'manager'` en la tabla `employees`
2. Verifica que el usuario tiene `status = 'active'` en la tabla `employees`
3. Ejecuta `diagnose-manager-access.sql` y comparte los resultados


