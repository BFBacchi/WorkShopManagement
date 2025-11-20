# Pasos para Solucionar el Acceso del Gerente

## ⚠️ Problema Detectado

El diagnóstico muestra que `auth.uid()` es `null`, lo que significa que:
- Estás ejecutando el script en SQL Editor sin estar autenticado como usuario
- O el usuario gerente no existe en la tabla `employees`

## ✅ Solución Paso a Paso

### PASO 1: Verificar que el Usuario Gerente Existe

**Ejecuta este script en Supabase SQL Editor:**

```sql
-- Archivo: verify-manager-direct.sql
```

Este script mostrará:
- Todos los usuarios con rol 'manager'
- Si tienen `status = 'active'`
- Si deberían tener acceso

**Si NO existe el usuario gerente o está inactivo:**

```sql
-- Actualizar un usuario existente a gerente
UPDATE employees 
SET role = 'manager', status = 'active' 
WHERE email = 'email_del_gerente@ejemplo.com';

-- O crear un nuevo usuario gerente (necesitas el ID del usuario de auth.users)
INSERT INTO employees (id, email, full_name, role, status)
VALUES (
  'ID_DEL_USUARIO_AUTH',  -- El ID del usuario en auth.users
  'gerente@ejemplo.com',
  'Nombre del Gerente',
  'manager',
  'active'
);
```

### PASO 2: Actualizar la Función RLS

**Ejecuta este script (CRÍTICO):**

```sql
-- Archivo: fix-rls-admin-manager-complete.sql
```

Este script:
- ✅ Actualiza `is_current_user_admin()` para incluir 'manager'
- ✅ Verifica que la función se creó correctamente
- ✅ Muestra las políticas RLS

**Verifica que la función incluye 'manager':**

Después de ejecutar el script, ejecuta:

```sql
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'is_current_user_admin';
```

Debe mostrar código que incluya: `role IN ('admin', 'manager')`

### PASO 3: Verificar desde la Aplicación

**La forma correcta de verificar es desde la aplicación:**

1. **Inicia sesión en la aplicación como usuario gerente**
2. **Abre la consola del navegador (F12)**
3. **Ejecuta:**

```javascript
// Verificar el usuario actual
const { data: { user } } = await supabase.auth.getUser();
console.log('Usuario:', user);

// Verificar el rol
const { data: employee } = await supabase
  .from('employees')
  .select('*')
  .eq('id', user.id)
  .single();
console.log('Empleado:', employee);

// Probar acceso a productos
const { data: products, error } = await supabase
  .from('products')
  .select('*');
console.log('Productos:', products);
console.log('Error:', error);
```

**Resultados esperados:**
- `employee.role` debe ser `'manager'`
- `employee.status` debe ser `'active'`
- `products` debe mostrar TODOS los productos (no solo los del usuario)
- `error` debe ser `null`

### PASO 4: Si Sigue Sin Funcionar

**Verifica estos puntos:**

1. **¿El usuario existe en `auth.users`?**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'email_del_gerente@ejemplo.com';
   ```

2. **¿El usuario existe en `employees`?**
   ```sql
   SELECT * FROM employees WHERE email = 'email_del_gerente@ejemplo.com';
   ```

3. **¿El ID coincide?**
   ```sql
   SELECT 
     u.id as auth_id,
     u.email as auth_email,
     e.id as employee_id,
     e.email as employee_email,
     e.role,
     e.status
   FROM auth.users u
   LEFT JOIN employees e ON e.id = u.id
   WHERE u.email = 'email_del_gerente@ejemplo.com';
   ```

4. **¿Las políticas RLS están correctas?**
   ```sql
   SELECT tablename, policyname, cmd, qual
   FROM pg_policies 
   WHERE tablename = 'products' 
   AND cmd = 'SELECT';
   ```

## 🔍 Diagnóstico Rápido

**Ejecuta este script para ver todo de un vistazo:**

```sql
-- Ver todos los usuarios y sus roles
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  CASE 
    WHEN role IN ('admin', 'manager') AND status = 'active' 
    THEN '✓ Debe tener acceso'
    ELSE '✗ NO debe tener acceso'
  END as acceso
FROM employees
ORDER BY role, email;

-- Ver la función actual
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'is_current_user_admin';

-- Ver políticas RLS de products
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products';
```

## 📝 Checklist Final

- [ ] Usuario gerente existe en `auth.users`
- [ ] Usuario gerente existe en `employees` con `role = 'manager'`
- [ ] Usuario gerente tiene `status = 'active'`
- [ ] El ID en `auth.users` coincide con el ID en `employees`
- [ ] La función `is_current_user_admin()` incluye `'manager'` en su código
- [ ] Las políticas RLS usan `is_current_user_admin()`
- [ ] Desde la aplicación, el usuario puede ver todos los datos

## 🆘 Si Nada Funciona

1. **Comparte los resultados de `verify-manager-direct.sql`**
2. **Comparte el código de la función** (del SELECT prosrc)
3. **Comparte un ejemplo de política RLS** (del SELECT de pg_policies)
4. **Verifica que ejecutaste `fix-rls-admin-manager-complete.sql` completo**


