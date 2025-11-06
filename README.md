# 🛠️ WorkShop Management

Sistema completo de gestión para talleres mecánicos que integra punto de venta (POS), gestión de reparaciones, inventario, análisis y gestión de clientes.

## ✨ Características

### 🎯 Módulos Principales

- **📊 Dashboard**: Vista general con métricas y estadísticas del taller
- **🔧 Reparaciones**: Gestión completa de órdenes de reparación
  - Creación y seguimiento de órdenes
  - Estados de reparación (Pendiente, En Proceso, Completada, Cancelada)
  - Detalles técnicos y notas
- **💰 Punto de Venta (POS)**: Sistema de ventas integrado
  - Catálogo de productos
  - Carrito de compras
  - Procesamiento de pagos
  - Historial de ventas
- **📦 Inventario**: Control de stock de productos
  - Gestión de productos
  - Control de existencias
  - Alertas de bajo stock
- **📈 Analytics**: Análisis y reportes
  - Ventas por período
  - Productos más vendidos
  - Métricas de reparaciones
  - Gráficos interactivos
- **👥 Clientes**: Base de datos de clientes
  - Registro y gestión de clientes
  - Historial de servicios
  - Información de contacto

### 🔐 Seguridad

- Autenticación con OTP (One-Time Password) por email
- Rutas protegidas con verificación de sesión
- Row Level Security (RLS) en Supabase
- Datos aislados por usuario

## 🚀 Tecnologías

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Zustand** - Gestión de estado
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### UI/UX
- **Tailwind CSS** - Estilos utility-first
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos
- **Recharts** - Gráficos y visualizaciones
- **Sonner** - Notificaciones toast

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
  - Row Level Security

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta en Supabase
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/BFBacchi/WorkShopManagement.git
cd WorkShopManagement
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

Sigue las instrucciones detalladas en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Resumen rápido:**

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

3. Ejecuta el script SQL en Supabase SQL Editor (archivo `supabase-schema.sql`)
4. Configura las plantillas de email para OTP en Supabase Authentication

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
WorkShopManagement/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # Componentes UI (Radix UI)
│   │   └── ProtectedRoute.tsx
│   ├── features/            # Funcionalidades por módulo
│   │   ├── pos/             # Módulo de punto de venta
│   │   └── repairs/         # Módulo de reparaciones
│   ├── pages/               # Páginas principales
│   ├── store/               # Stores de Zustand
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilidades y configuraciones
│   └── main.tsx             # Punto de entrada
├── supabase-schema.sql      # Esquema de base de datos
├── SUPABASE_SETUP.md        # Guía de configuración
└── package.json
```

## 🗄️ Base de Datos

El sistema utiliza las siguientes tablas principales:

- **products**: Productos para inventario y POS
- **sales**: Ventas realizadas
- **customers**: Clientes del taller
- **repair_orders**: Órdenes de reparación

Todas las tablas implementan Row Level Security (RLS) para asegurar que cada usuario solo acceda a sus propios datos.

## 📝 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run preview  # Previsualiza la build de producción
npm run lint     # Ejecuta el linter
```

## 🔒 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

**⚠️ Importante**: Nunca commitees el archivo `.env` al repositorio.

## 🎨 Características de UI

- Diseño responsive y moderno
- Tema claro/oscuro (preparado con next-themes)
- Componentes accesibles (WCAG compliant)
- Animaciones suaves
- Feedback visual inmediato

## 📱 Páginas y Rutas

- `/login` - Página de inicio de sesión
- `/dashboard` - Panel principal con métricas
- `/repairs` - Gestión de reparaciones
- `/pos` - Punto de venta
- `/inventory` - Gestión de inventario
- `/analytics` - Análisis y reportes
- `/customers` - Gestión de clientes

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso personal.

## 👤 Autor

**Bruno Bacchi**
- GitHub: [@BFBacchi](https://github.com/BFBacchi)
- Ubicación: Villa Mercedes, San Luis, Argentina

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por el excelente backend
- [Radix UI](https://www.radix-ui.com/) por los componentes accesibles
- [Vite](https://vitejs.dev/) por la experiencia de desarrollo
- Comunidad de React y TypeScript

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub.

