# 🚨 Panel de Alertas - Alcaldía de Medellín

Sistema de monitoreo en tiempo real para alertas de proyectos estratégicos de la Alcaldía de Medellín.

## 🎯 Características Principales

- **Dashboard en tiempo real** con alertas de proyectos estratégicos
- **Filtros avanzados** por dependencia, gravedad, impacto y comuna
- **Notificaciones** para alertas críticas
- **Exportación de datos** por dependencia
- **Interfaz responsive** optimizada para móviles
- **Tema personalizado** con colores institucionales

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Estado**: Zustand + React Query
- **Animaciones**: Framer Motion
- **Build Tool**: Vite
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier
- **Containerización**: Docker + Nginx

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── common/          # Componentes reutilizables
│   ├── Layout.tsx       # Layout principal
│   └── DetailDrawer.tsx # Drawer de detalles
├── hooks/               # Hooks personalizados
├── services/            # Servicios de API
├── utils/               # Utilidades
├── constants/           # Constantes de la aplicación
├── types/               # Definiciones de tipos
├── store/               # Estado global
├── theme/               # Tema de Material-UI
└── pages/               # Páginas
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/alcaldia-medellin/alertas-web.git

# Navegar al directorio
cd alertas-web

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local
```

### Variables de Entorno

```env
VITE_API_BASE=https://visorestrategicobackend-gkejc4hthnace6b4.eastus2-01.azurewebsites.net/api/powerbi
VITE_API_KEY=pow3rb1_visor_3str4t3g1co_2025
VITE_SOCKET_URL=wss://your-socket-server.com
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm run test

# Ejecutar linting
npm run lint

# Formatear código
npm run format
```

### Producción

```bash
# Construir para producción
npm run build

# Preview de producción
npm run preview
```

## 🐳 Docker

### Desarrollo

```bash
# Construir imagen de desarrollo
docker build -f Dockerfile.dev -t alertas-web:dev .

# Ejecutar contenedor de desarrollo
docker run -p 74:74 alertas-web:dev
```

### Producción

```bash
# Construir imagen de producción
docker build -t alertas-web:prod .

# Ejecutar contenedor de producción
docker run -p 3000:80 alertas-web:prod
```

### Docker Compose

```bash
# Desarrollo
docker-compose up dev

# Producción
docker-compose up app
```

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests para CI
npm run test:ci
```

## 📊 Scripts Disponibles

| Script          | Descripción                   |
| --------------- | ----------------------------- |
| `dev`           | Servidor de desarrollo        |
| `build`         | Construcción para producción  |
| `preview`       | Preview de producción         |
| `test`          | Ejecutar tests                |
| `test:coverage` | Tests con cobertura           |
| `test:ci`       | Tests para CI                 |
| `lint`          | Ejecutar ESLint               |
| `lint:fix`      | Corregir errores de ESLint    |
| `format`        | Formatear código con Prettier |
| `format:check`  | Verificar formato             |
| `type-check`    | Verificar tipos TypeScript    |

## 🎨 Sistema de Diseño

### Colores

- **Primario**: `#00C9FF` (Cian institucional)
- **Secundario**: `#00A89C` (Teal)
- **Error**: `#FF3B30` (Rojo para alertas críticas)
- **Warning**: `#FFA726` (Naranja para advertencias)
- **Success**: `#66BB6A` (Verde para estado OK)

### Tipografía

- **Fuente principal**: Inter, Roboto, Helvetica, Arial
- **Pesos**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## 🔧 Configuración de Desarrollo

### VSCode

El proyecto incluye configuración de VSCode en `.vscode/settings.json`:

- Formateo automático al guardar
- Linting automático
- Configuración de TypeScript
- Reglas de línea a 100 caracteres

### ESLint

Configuración estricta de ESLint en `eslint.config.js`:

- Reglas de TypeScript
- Reglas de React Hooks
- Reglas de React Refresh
- Prevención de variables no utilizadas

### Prettier

Configuración de Prettier en `.prettierrc`:

- Comillas simples
- Punto y coma obligatorio
- Línea máxima de 100 caracteres
- Tabs de 2 espacios

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod
```

### Docker

```bash
# Construir imagen
docker build -t alertas-web .

# Ejecutar contenedor
docker run -p 3000:80 alertas-web
```

## 📈 Monitoreo y Analytics

- **Performance**: Core Web Vitals
- **Errores**: Console errors tracking
- **Uso**: Google Analytics (opcional)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- **Commits**: Usar Conventional Commits
- **Branches**: `feature/`, `bugfix/`, `hotfix/`
- **Naming**: PascalCase para componentes, camelCase para funciones
- **Testing**: Escribir tests para nuevas funcionalidades

## 📝 Changelog

### v1.0.0

- ✅ Dashboard principal con alertas
- ✅ Sistema de filtros avanzado
- ✅ Notificaciones en tiempo real
- ✅ Exportación de datos
- ✅ Diseño responsive
- ✅ Tema personalizado

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo**: Equipo de Desarrollo - Alcaldía de Medellín
- **Diseño**: Equipo de UX/UI - Alcaldía de Medellín
- **Producto**: Secretaría de Infraestructura Física

## 📞 Soporte

Para soporte técnico o reportar bugs:

- **Email**: soporte@medellin.gov.co
- **Issues**: [GitHub Issues](https://github.com/alcaldia-medellin/alertas-web/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/alcaldia-medellin/alertas-web/wiki)

---

**Desarrollado con ❤️ para la Alcaldía de Medellín**
