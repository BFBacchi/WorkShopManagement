# This file is only for editing file nodes, do not break the structure

## Project Description
Sistema integral de gestión para talleres de reparación de celulares que integra órdenes de servicio, punto de venta, inventario, analíticas y asistente IA. Diseñado para optimizar operaciones diarias con interfaz profesional y funcional.

## Key Features
- ✅ Sistema de autenticación con OTP por email
- ✅ Dashboard principal con vista general del negocio
- ✅ Navegación modular con código de colores por área
- ✅ Gestión completa de órdenes de reparación con flujo de estados
- ✅ Formulario multi-paso para nuevas órdenes (cliente + dispositivo)
- ✅ Vista detallada de órdenes con edición de diagnóstico
- ✅ Actualización de estados de reparación
- ✅ Base de datos de clientes con detección automática
- ✅ Punto de venta touch-optimizado con carrito de compras
- ✅ Catálogo de productos con búsqueda y filtros
- ✅ Sistema de descuentos (porcentaje y monto fijo)
- ✅ Múltiples métodos de pago (efectivo, tarjeta, transferencia)
- ✅ Gestión de inventario integrada con alertas de stock bajo
- ✅ Registro automático de ventas con actualización de stock
- 🚧 Control avanzado de inventario y reportes (Fase 4)
- 🚧 Asistente IA conversacional (Fase 5)
- 🚧 Dashboard analítico con métricas (Fase 6)
- 🚧 Gestión de clientes y notificaciones (Fase 7)

## Data Storage
Tables: 
- customers (f31rcbimzqps) - Base de datos de clientes
- repair_orders (f31rcbimzqpt) - Órdenes de reparación con estados y seguimiento
- products (f31s3bgd6osg) - Catálogo de productos para venta (equipos, accesorios, refacciones)
- sales (f31s3bgd6osh) - Registro de transacciones de venta
Local: Zustand persist for auth state

## Devv SDK Integration
Built-in: 
- Auth (email OTP) - Sistema de autenticación
- Table API - Gestión de datos para clientes, órdenes, productos y ventas
External: None yet (Resend for emails will be added in Phase 7)

## Special Requirements
- Design System: Minimalismo Funcional con código de colores por módulo
- Color Coding: Azul (Reparaciones), Verde (Ventas/POS), Naranja (Inventario), Morado (Analíticas), Teal (Clientes)
- Touch Optimization: Botones mínimo 44px para terminal POS
- Multi-device Support: Responsive para tablets y móviles
- Spanish Language: Toda la interfaz en español

## File Structure

/src
├── features/
│   ├── repairs/              # Repair orders feature module
│   │   ├── components/
│   │   │   ├── NewOrderDialog.tsx      # Multi-step form: customer + device info, query-back pattern for IDs
│   │   │   ├── OrderList.tsx           # Orders list with search and status filters
│   │   │   └── OrderDetail.tsx         # Full order view with status timeline and editing
│   │   ├── stores/
│   │   │   └── repairs-store.ts        # Zustand store for orders and customers
│   │   ├── utils/
│   │   │   └── order-utils.ts          # Utility functions (formatting, colors, etc.)
│   │   └── types.ts                    # TypeScript types for repairs domain
│   │
│   └── pos/                  # Point of Sale feature module [Phase 3 ✓]
│       ├── components/
│       │   ├── ProductCatalog.tsx      # Touch-optimized product grid with search
│       │   ├── ShoppingCart.tsx        # Cart with quantity controls and discount
│       │   ├── CheckoutDialog.tsx      # Payment processing with multiple methods
│       │   └── AddProductDialog.tsx    # Form to add new products to inventory
│       ├── stores/
│       │   └── pos-store.ts            # Zustand store for products, cart, and sales
│       ├── utils/
│       │   └── pos-utils.ts            # Formatting, discount calculations, etc.
│       └── types.ts                    # TypeScript types for POS domain
│
├── components/
│   ├── ui/                    # Pre-installed shadcn/ui components
│   └── ProtectedRoute.tsx     # Route guard component for authentication
│
├── pages/
│   ├── LoginPage.tsx          # Email OTP authentication page
│   ├── DashboardPage.tsx      # Main dashboard with module navigation
│   ├── RepairsPage.tsx        # Repairs module with full CRUD functionality [Phase 2 ✓]
│   ├── POSPage.tsx            # Point of sale module with touch interface [Phase 3 ✓]
│   ├── InventoryPage.tsx      # Inventory module placeholder [next: Phase 4]
│   ├── AnalyticsPage.tsx      # Analytics module placeholder [next: Phase 6]
│   ├── CustomersPage.tsx      # Customers module placeholder [next: Phase 7]
│   └── NotFoundPage.tsx       # 404 error page
│
├── store/
│   └── auth-store.ts          # Zustand auth store with persistence
│
├── hooks/
│   ├── use-mobile.ts          # Mobile detection Hook
│   └── use-toast.ts           # Toast notification system Hook
│
├── lib/
│   └── utils.ts               # Utility functions
│
├── App.tsx                    # Root component with route configuration
│                              # Public routes: /, /login
│                              # Protected routes: /dashboard, /repairs, /pos, /inventory, /analytics, /customers
│
├── main.tsx                   # Entry file
│
└── index.css                  # Design system with module color definitions
