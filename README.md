# 🚨 Dashboard de Alertas - Alcaldía

Sistema de monitoreo en tiempo real para alertas de proyectos y obras de la alcaldía.

## 🚀 Despliegue en Vercel

### Variables de Entorno Requeridas

Configura estas variables en Vercel Dashboard > Settings > Environment Variables:

```env
VITE_API_BASE=https://tu-api.com
VITE_API_KEY=tu-api-key
VITE_SOCKET_URL=wss://tu-socket.com
```

### Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Tests
npm run test

# Linting
npm run lint
```

## 🛠️ Tecnologías

- **Frontend:** React 18 + TypeScript
- **UI:** Material-UI v5 + Framer Motion
- **Estado:** Zustand + React Query
- **Tiempo Real:** Socket.io
- **Build:** Vite
- **Deploy:** Vercel

## 📋 Funcionalidades

- ✅ Dashboard interactivo con alertas en tiempo real
- ✅ Filtros por dependencia, gravedad e impacto
- ✅ Exportación a CSV
- ✅ Notificaciones push para alertas críticas
- ✅ Diseño responsive y accesible
- ✅ Animaciones suaves con Framer Motion

## 🔧 Configuración Local

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Crea `.env.local` con las variables de entorno
4. Ejecuta: `npm run dev`

## 📱 Imagen de Fondo

Coloca tu imagen de fondo en `public/image.png` para que aparezca como background del dashboard.

## 🌐 Despliegue

El proyecto está configurado para desplegarse automáticamente en Vercel cuando hagas push a la rama principal.
