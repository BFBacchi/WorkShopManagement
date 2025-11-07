-- Script para corregir políticas RLS de la tabla products
-- Ejecuta este script en el SQL Editor de Supabase

-- Primero, eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

-- Asegurar que RLS está habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Recrear las políticas con nombres únicos y correctos
CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Verificar que las políticas se crearon correctamente
-- Puedes ejecutar esto para verificar:
-- SELECT * FROM pg_policies WHERE tablename = 'products';

