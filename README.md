# 🛠️ WorkShop Management

Sistema completo de gestión para talleres mecánicos que integra punto de venta (POS), gestión de reparaciones, inventario, análisis y gestión de clientes.

## 🚀 Demo en Vivo

Puedes probar la aplicación en producción:

**URL:** https://work-shop-management.vercel.app/

**Credenciales de acceso:**
- **Usuario:** test@test.com
- **Contraseña:** test

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
- **👥 Clientes**: Gestión completa de clientes
  - Base de datos de clientes con historial completo
  - Perfiles de cliente con estadísticas detalladas
  - Sistema de puntos de lealtad
  - Búsqueda y filtrado avanzado
  - Recordatorios de mantenimiento automáticos
  - Notificaciones por email (integración con Resend)
- **🤖 Asistente IA**: Chatbot inteligente con OpenAI
  - Consultas en lenguaje natural sobre órdenes, productos y ventas
  - Reconocimiento de voz del navegador
  - Base de conocimiento técnica para reparaciones comunes
  - Sugerencias de comandos inteligentes
  - Acceso a datos en tiempo real desde la base de datos

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

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key

# OpenAI Configuration (para Asistente IA)
VITE_OPENAI_API_KEY=tu_openai_api_key

# Resend Configuration (para Notificaciones por Email)
VITE_RESEND_API_KEY=tu_resend_api_key
```

**Configuración de Supabase:**

Sigue las instrucciones detalladas en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script SQL en Supabase SQL Editor (archivo `supabase-schema.sql`)
3. Ejecuta la migración de Phase 7 (archivo `supabase-phase7-migration.sql`) para agregar campos de lealtad y tabla de recordatorios
4. Ejecuta la migración de Phase 8 (archivo `supabase-phase8-migration.sql`) para agregar tablas de configuración y plantillas de recibos
5. Configura las plantillas de email para OTP en Supabase Authentication

**Configuración de OpenAI (Opcional para Asistente IA):**

1. Crea una cuenta en [OpenAI](https://platform.openai.com)
2. Genera una API key en [API Keys](https://platform.openai.com/api-keys)
3. Agrega la clave a tu archivo `.env` como `VITE_OPENAI_API_KEY`

**Nota:** El asistente IA funcionará sin la API key de OpenAI, pero mostrará un mensaje informativo. Para usar todas las funcionalidades de IA, se requiere una API key válida.

**Configuración de Resend (Opcional para Notificaciones por Email):**

1. Crea una cuenta en [Resend](https://resend.com)
2. Genera una API key en [API Keys](https://resend.com/api-keys)
3. Agrega la clave a tu archivo `.env` como `VITE_RESEND_API_KEY`
4. Verifica tu dominio en Resend para enviar emails

**Nota:** El sistema de notificaciones funcionará sin la API key de Resend, pero no podrá enviar emails. Los recordatorios se mostrarán en la interfaz pero no se enviarán automáticamente.

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
- **customers**: Clientes del taller (con puntos de lealtad)
- **repair_orders**: Órdenes de reparación
- **maintenance_reminders**: Recordatorios de mantenimiento
- **business_settings**: Configuración del negocio
- **receipt_templates**: Plantillas personalizadas de recibos

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
- `/settings` - Configuración del sistema

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

