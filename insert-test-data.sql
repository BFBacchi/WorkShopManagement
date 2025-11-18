-- Script para insertar datos de prueba: 10 productos y 10 órdenes de reparación
-- Ejecuta este script en Supabase SQL Editor
-- IMPORTANTE: Este script obtiene el user_id del primer administrador de la tabla employees
-- Si no hay administradores, el script fallará. Asegúrate de tener al menos un usuario admin.

-- Obtener el user_id del primer administrador
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Obtener el ID del primer administrador activo
  SELECT id INTO admin_user_id
  FROM employees
  WHERE role = 'admin' AND status = 'active'
  LIMIT 1;
  
  -- Si no hay administrador, usar auth.uid() como fallback
  IF admin_user_id IS NULL THEN
    admin_user_id := auth.uid();
  END IF;
  
  -- Si aún es NULL, lanzar error
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún administrador activo. Asegúrate de tener al menos un usuario con role=''admin'' y status=''active'' en la tabla employees, o ejecuta este script autenticado como usuario.';
  END IF;
  
  -- Guardar el user_id en una variable de sesión temporal
  PERFORM set_config('app.current_user_id', admin_user_id::TEXT, false);
END $$;

-- ============================================
-- 1. INSERTAR 10 PRODUCTOS AL INVENTARIO
-- ============================================

-- Función auxiliar para obtener el user_id
CREATE OR REPLACE FUNCTION get_admin_user_id()
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Primero intentar obtener de la variable de sesión
  admin_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;
  
  -- Si no está en la variable, buscar en employees
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id
    FROM employees
    WHERE role = 'admin' AND status = 'active'
    LIMIT 1;
  END IF;
  
  -- Si aún es NULL, usar auth.uid() como último recurso
  IF admin_id IS NULL THEN
    admin_id := auth.uid();
  END IF;
  
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql STABLE;

INSERT INTO products (
  user_id,
  name,
  category,
  subcategory,
  brand,
  model,
  sku,
  barcode,
  price,
  cost,
  stock,
  min_stock,
  status,
  description,
  image_url
) VALUES
-- Equipos (devices)
(
  get_admin_user_id(),
  'iPhone 15 Pro Max 256GB',
  'device',
  'Smartphone',
  'Apple',
  'iPhone 15 Pro Max',
  'IPH15PM256',
  '1234567890123',
  1299.99,
  1100.00,
  5,
  2,
  'active',
  'iPhone 15 Pro Max con 256GB de almacenamiento, pantalla Super Retina XDR de 6.7 pulgadas',
  'https://www.apple.com/v/iphone-15-pro/a/images/overview/hero/hero_endframe__e6khcva4hkeq_large.jpg'
),
(
  get_admin_user_id(),
  'Samsung Galaxy S24 Ultra',
  'device',
  'Smartphone',
  'Samsung',
  'Galaxy S24 Ultra',
  'SGS24U512',
  '1234567890124',
  1199.99,
  1000.00,
  8,
  3,
  'active',
  'Samsung Galaxy S24 Ultra con 512GB, S Pen incluido, cámara de 200MP',
  'https://images.samsung.com/is/image/samsung/p6pim/mx/2401/gallery/mx-galaxy-s24-s928-sm-s928bzkgmxa-thumb-539200000?$650_519_PNG$'
),
(
  get_admin_user_id(),
  'MacBook Pro 14" M3',
  'device',
  'Laptop',
  'Apple',
  'MacBook Pro 14"',
  'MBP14M3',
  '1234567890125',
  1999.99,
  1700.00,
  3,
  1,
  'active',
  'MacBook Pro 14 pulgadas con chip M3, 16GB RAM, 512GB SSD',
  'https://www.apple.com/v/macbook-pro-14-and-16/a/images/overview/hero/hero_intro_endframe__e6khcva4hkeq_large.jpg'
),
(
  get_admin_user_id(),
  'iPad Air 11" M2',
  'device',
  'Tablet',
  'Apple',
  'iPad Air 11"',
  'IPADAIR11',
  '1234567890126',
  599.99,
  500.00,
  12,
  5,
  'active',
  'iPad Air de 11 pulgadas con chip M2, compatible con Apple Pencil',
  'https://www.apple.com/v/ipad-air/a/images/overview/hero/hero_endframe__e6khcva4hkeq_large.jpg'
),
-- Accesorios (accessories)
(
  get_admin_user_id(),
  'Cargador USB-C 20W',
  'accessory',
  'Cargador',
  'Apple',
  'USB-C Power Adapter',
  'CHG20W',
  '1234567890127',
  19.99,
  8.00,
  50,
  20,
  'active',
  'Cargador rápido USB-C de 20W para iPhone y iPad',
  'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MU7P2?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=1633024800000'
),
(
  get_admin_user_id(),
  'Cable Lightning a USB-C',
  'accessory',
  'Cable',
  'Apple',
  'Lightning Cable 1m',
  'CBL-LT-1M',
  '1234567890128',
  19.99,
  5.00,
  100,
  30,
  'active',
  'Cable Lightning a USB-C de 1 metro, original Apple',
  'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MU7Y2?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=1633024800000'
),
(
  get_admin_user_id(),
  'Funda Protectora iPhone 15',
  'accessory',
  'Funda',
  'Spigen',
  'Ultra Hybrid',
  'CASE-IPH15',
  '1234567890129',
  24.99,
  10.00,
  30,
  10,
  'active',
  'Funda transparente con protección de esquinas para iPhone 15',
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop'
),
(
  get_admin_user_id(),
  'Protector de Pantalla iPhone 15',
  'accessory',
  'Protector',
  'Belkin',
  'ScreenForce',
  'SCR-IPH15',
  '1234567890130',
  29.99,
  12.00,
  40,
  15,
  'active',
  'Protector de pantalla de vidrio templado para iPhone 15',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=800&fit=crop'
),
-- Refacciones (parts)
(
  get_admin_user_id(),
  'Batería iPhone 13',
  'part',
  'Batería',
  'OEM',
  'iPhone 13 Battery',
  'BAT-IPH13',
  '1234567890131',
  49.99,
  20.00,
  15,
  5,
  'active',
  'Batería de reemplazo para iPhone 13, capacidad 3240mAh',
  'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop'
),
(
  get_admin_user_id(),
  'Pantalla iPhone 12',
  'part',
  'Pantalla',
  'OEM',
  'iPhone 12 Display',
  'DSP-IPH12',
  '1234567890132',
  89.99,
  45.00,
  10,
  3,
  'active',
  'Pantalla LCD de reemplazo para iPhone 12, incluye marco',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=800&fit=crop'
);

-- ============================================
-- 2. INSERTAR CLIENTES (necesarios para órdenes de reparación)
-- ============================================

-- Primero, crear algunos clientes si no existen
INSERT INTO customers (
  user_id,
  name,
  phone,
  email,
  address
) VALUES
(
  get_admin_user_id(),
  'Juan Pérez',
  '+5491123456789',
  'juan.perez@email.com',
  'Av. Corrientes 1234, CABA'
),
(
  get_admin_user_id(),
  'María González',
  '+5491123456790',
  'maria.gonzalez@email.com',
  'Av. Santa Fe 5678, CABA'
),
(
  get_admin_user_id(),
  'Carlos Rodríguez',
  '+5491123456791',
  'carlos.rodriguez@email.com',
  'Av. Cabildo 9012, CABA'
),
(
  get_admin_user_id(),
  'Ana Martínez',
  '+5491123456792',
  'ana.martinez@email.com',
  'Av. Rivadavia 3456, CABA'
),
(
  get_admin_user_id(),
  'Luis Fernández',
  '+5491123456793',
  'luis.fernandez@email.com',
  'Av. Córdoba 7890, CABA'
),
(
  get_admin_user_id(),
  'Laura Sánchez',
  '+5491123456794',
  'laura.sanchez@email.com',
  'Av. Libertador 2345, CABA'
),
(
  get_admin_user_id(),
  'Roberto López',
  '+5491123456795',
  'roberto.lopez@email.com',
  'Av. Juan B. Justo 6789, CABA'
),
(
  get_admin_user_id(),
  'Sofía Díaz',
  '+5491123456796',
  'sofia.diaz@email.com',
  'Av. Scalabrini Ortiz 1234, CABA'
),
(
  get_admin_user_id(),
  'Diego Torres',
  '+5491123456797',
  'diego.torres@email.com',
  'Av. Las Heras 5678, CABA'
),
(
  get_admin_user_id(),
  'Carmen Ruiz',
  '+5491123456798',
  'carmen.ruiz@email.com',
  'Av. Pueyrredón 9012, CABA'
)
ON CONFLICT DO NOTHING; -- Evitar duplicados si ya existen

-- ============================================
-- 3. INSERTAR 10 ÓRDENES DE REPARACIÓN
-- ============================================

-- Insertar órdenes usando los clientes creados
-- Usamos un bloque DO para iterar sobre los clientes
DO $$
DECLARE
  customer_rec RECORD;
  order_num TEXT;
  order_counter INTEGER := 1;
  base_date TEXT;
  admin_user_id UUID;
BEGIN
  -- Obtener el user_id del administrador
  admin_user_id := get_admin_user_id();
  
  -- Obtener la fecha base para los números de orden
  base_date := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Iterar sobre los primeros 10 clientes
  FOR customer_rec IN 
    SELECT id, name, phone 
    FROM customers 
    WHERE user_id = admin_user_id
    ORDER BY created_at
    LIMIT 10
  LOOP
    -- Generar número de orden único
    order_num := 'ORD-' || base_date || '-' || LPAD(order_counter::TEXT, 4, '0');
    
    -- Insertar orden según el contador
    CASE order_counter
      WHEN 1 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Apple', 'iPhone 13 Pro', '123456789012345', '1234',
          'Pantalla rota', 'Pantalla LCD dañada, requiere reemplazo', 150.00, NULL,
          'received', NULL, 'high', 'Cliente reporta caída del dispositivo', NOW() + INTERVAL '3 days'
        );
      WHEN 2 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Samsung', 'Galaxy S21', '987654321098765', '0000',
          'No enciende', 'Batería agotada, posible falla en placa madre', 200.00, NULL,
          'diagnosed', 'Técnico Juan', 'urgent', 'Cliente necesita dispositivo urgentemente', NOW() + INTERVAL '5 days'
        );
      WHEN 3 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Apple', 'iPhone 12', '555555555555555', '5678',
          'Cámara no funciona', 'Módulo de cámara trasera defectuoso', 120.00, NULL,
          'in_repair', 'Técnico María', 'medium', 'En espera de repuesto', NOW() + INTERVAL '7 days'
        );
      WHEN 4 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Xiaomi', 'Redmi Note 11', '111111111111111', NULL,
          'Problema de carga', 'Puerto de carga sucio, limpieza requerida', 30.00, 25.00,
          'finished', 'Técnico Carlos', 'low', 'Reparación completada', NOW() + INTERVAL '1 day'
        );
      WHEN 5 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Apple', 'iPhone 14 Pro Max', '222222222222222', '9999',
          'Botón de volumen no responde', 'Botón físico dañado, requiere reemplazo', 80.00, NULL,
          'waiting_parts', 'Técnico Ana', 'medium', 'Esperando repuesto de botón', NOW() + INTERVAL '10 days'
        );
      WHEN 6 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Samsung', 'Galaxy A54', '333333333333333', '1234',
          'Pantalla con líneas', 'Pantalla AMOLED con líneas verticales', 180.00, NULL,
          'received', NULL, 'high', 'Cliente reporta problema reciente', NOW() + INTERVAL '4 days'
        );
      WHEN 7 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Apple', 'iPad Air 4', NULL, NULL,
          'No carga', 'Puerto Lightning dañado, requiere reparación', 100.00, NULL,
          'diagnosed', 'Técnico Luis', 'medium', 'Diagnóstico completado', NOW() + INTERVAL '6 days'
        );
      WHEN 8 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Motorola', 'Moto G82', '444444444444444', NULL,
          'Altavoz no funciona', 'Altavoz superior dañado', 50.00, 45.00,
          'delivered', 'Técnico Laura', 'low', 'Reparación entregada al cliente', NOW() - INTERVAL '2 days'
        );
      WHEN 9 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Apple', 'iPhone 11', '666666666666666', '0000',
          'Batería se agota rápido', 'Batería con capacidad reducida al 65%', 60.00, NULL,
          'in_repair', 'Técnico Roberto', 'medium', 'Reemplazo de batería en proceso', NOW() + INTERVAL '3 days'
        );
      WHEN 10 THEN
        INSERT INTO repair_orders (
          user_id, order_number, customer_id, customer_name, customer_phone,
          device_brand, device_model, device_imei, device_password,
          reported_issue, diagnosis, estimated_cost, final_cost,
          status, assigned_technician, priority, notes, estimated_delivery
        ) VALUES (
          admin_user_id, order_num, customer_rec.id, customer_rec.name, customer_rec.phone,
          'Samsung', 'Galaxy S22 Ultra', '777777777777777', '8888',
          'Cámara frontal borrosa', 'Lente de cámara frontal rayado', 90.00, NULL,
          'received', NULL, 'medium', 'Cliente trajo dispositivo hoy', NOW() + INTERVAL '5 days'
        );
    END CASE;
    
    order_counter := order_counter + 1;
  END LOOP;
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar productos insertados
SELECT 
  name,
  category,
  brand,
  stock,
  price,
  status
FROM products
WHERE user_id = get_admin_user_id()
ORDER BY created_at DESC
LIMIT 10;

-- Verificar órdenes de reparación insertadas
SELECT 
  order_number,
  customer_name,
  device_brand,
  device_model,
  status,
  priority,
  estimated_cost
FROM repair_orders
WHERE user_id = get_admin_user_id()
ORDER BY created_at DESC
LIMIT 10;

-- Contar totales
SELECT 
  'Productos' as tipo,
  COUNT(*) as total
FROM products
WHERE user_id = get_admin_user_id()
UNION ALL
SELECT 
  'Órdenes de Reparación',
  COUNT(*)
FROM repair_orders
WHERE user_id = get_admin_user_id();

-- NOTA: Este script inserta datos de prueba usando el primer administrador activo de la tabla employees
-- Asegúrate de tener al menos un usuario con role='admin' y status='active' en la tabla employees

