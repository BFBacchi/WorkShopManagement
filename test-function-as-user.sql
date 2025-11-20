-- Script para probar la función como un usuario específico
-- IMPORTANTE: Este script simula cómo funcionaría la función cuando un usuario está autenticado
-- Reemplaza 'TU_USER_ID_AQUI' con el ID real del usuario gerente

-- ============================================
-- PASO 1: Obtener el ID del usuario gerente
-- ============================================

-- Primero, encuentra el ID del usuario gerente
SELECT 
  id as user_id,
  email,
  full_name,
  role,
  status
FROM employees 
WHERE role = 'manager' AND status = 'active'
LIMIT 1;

-- ============================================
-- PASO 2: Verificar manualmente si ese usuario debería tener acceso
-- ============================================

-- Reemplaza 'TU_USER_ID_AQUI' con el ID que obtuviste arriba
-- Por ejemplo: '123e4567-e89b-12d3-a456-426614174000'

WITH test_user_id AS (
  SELECT 'TU_USER_ID_AQUI'::uuid as uid  -- REEMPLAZA ESTO con el ID real
)
SELECT 
  e.id,
  e.email,
  e.full_name,
  e.role,
  e.status,
  CASE 
    WHEN e.role IN ('admin', 'manager') AND e.status = 'active' THEN '✓ Debe tener acceso'
    ELSE '✗ NO debe tener acceso'
  END as deberia_tener_acceso,
  -- Simular lo que hace la función is_current_user_admin()
  EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE id = t.uid 
      AND role IN ('admin', 'manager')
      AND status = 'active'
  ) as funcion_deberia_retornar_true
FROM test_user_id t
LEFT JOIN employees e ON e.id = t.uid;

-- ============================================
-- PASO 3: Probar acceso a tablas (simulado)
-- ============================================

-- Nota: Esto solo funciona si ejecutas como superusuario
-- En producción, el usuario debe estar autenticado en la aplicación

-- Para probar realmente, necesitas:
-- 1. Iniciar sesión en la aplicación como usuario gerente
-- 2. Abrir la consola del navegador (F12)
-- 3. Ejecutar: await supabase.from('products').select('*')
-- 4. Verificar que retorna todos los productos

-- ============================================
-- ALTERNATIVA: Crear función de prueba temporal
-- ============================================

-- Esta función te permite probar con un ID específico
CREATE OR REPLACE FUNCTION test_is_user_admin_or_manager(test_user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_or_manager BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.employees 
    WHERE id = test_user_uuid 
      AND role IN ('admin', 'manager')
      AND status = 'active'
  ) INTO is_admin_or_manager;
  
  RETURN COALESCE(is_admin_or_manager, false);
END;
$$;

-- Probar la función con el ID del usuario gerente
-- Reemplaza 'TU_USER_ID_AQUI' con el ID real
SELECT 
  test_is_user_admin_or_manager('TU_USER_ID_AQUI'::uuid) as resultado,
  'Debe ser TRUE si el usuario es admin o manager activo' as esperado;

-- Limpiar función temporal (opcional)
-- DROP FUNCTION IF EXISTS test_is_user_admin_or_manager(UUID);


