# Estructura del Proyecto - Panel de Alertas

## 📁 Organización de Carpetas

```
src/
├── components/           # Componentes React
│   ├── common/          # Componentes reutilizables
│   │   ├── StatsCard.tsx    # Tarjeta de estadísticas
│   │   ├── AlertCard.tsx    # Tarjeta de alerta individual
│   │   └── FilterPanel.tsx  # Panel de filtros
│   ├── Layout.tsx       # Layout principal
│   ├── DetailDrawer.tsx # Drawer de detalles
│   └── NotificationProvider.tsx # Provider de notificaciones
├── hooks/               # Hooks personalizados
│   ├── useAlertas.ts    # Hook para alertas
│   └── useFilters.ts    # Hook para filtros
├── services/            # Servicios de API
│   ├── alertasApi.ts    # API de alertas
│   ├── severity.ts      # Servicio de severidad
│   └── schemaDetection.ts # Detección de esquemas
├── utils/               # Utilidades
│   ├── severity.ts      # Utilidades de severidad
│   ├── dateFormatting.ts # Formateo de fechas
│   └── export.ts        # Utilidades de exportación
├── constants/           # Constantes de la aplicación
│   └── index.ts         # Todas las constantes
├── types/               # Definiciones de tipos
│   ├── index.ts         # Tipos base
│   └── api.ts           # Tipos de API
├── store/               # Estado global
│   └── settings.ts      # Store de configuración
├── theme/               # Tema de Material-UI
│   └── theme.ts         # Configuración del tema
└── pages/               # Páginas
    └── Dashboard.tsx    # Página principal
```

## 🎯 Mejoras Implementadas

### 1. **Separación de Responsabilidades**

- **Componentes reutilizables**: `StatsCard`, `AlertCard`, `FilterPanel`
- **Hooks personalizados**: `useFilters` para lógica de filtrado
- **Utilidades puras**: Funciones sin efectos secundarios
- **Constantes centralizadas**: Todos los valores mágicos en un lugar

### 2. **Mejores Prácticas de React**

- **Componentes pequeños**: Cada componente tiene una responsabilidad específica
- **Props tipadas**: Interfaces TypeScript para todas las props
- **Hooks personalizados**: Lógica reutilizable extraída de componentes
- **Memoización**: Uso de `useMemo` y `useCallback` donde es necesario

### 3. **Organización del Código**

- **Eliminación de duplicación**: Código común extraído a utilidades
- **Constantes centralizadas**: Valores mágicos movidos a `constants/index.ts`
- **Tipos bien definidos**: Interfaces claras y específicas
- **Documentación**: Comentarios JSDoc en funciones complejas

### 4. **Performance**

- **Componentes optimizados**: Menos re-renders innecesarios
- **Lazy loading**: Componentes cargados solo cuando se necesitan
- **Memoización inteligente**: Cálculos costosos memoizados

## 🔧 Componentes Principales

### `StatsCard`

Componente reutilizable para mostrar estadísticas con:

- Animaciones personalizables
- Estados de selección
- Iconos y colores configurables

### `AlertCard`

Componente para mostrar alertas individuales con:

- Detección automática de prioridad
- Chips de impacto dinámicos
- Animaciones de estado crítico

### `FilterPanel`

Panel de filtros reutilizable con:

- Búsqueda por texto
- Filtros por dependencia, gravedad, impacto y comuna
- Estado sincronizado con el store global

### `useFilters`

Hook personalizado que maneja:

- Filtrado de alertas
- Agrupación por dependencia
- Cálculo de estadísticas
- Proyectos prioritarios

## 📊 Flujo de Datos

```
API → useAlertas → useFilters → Componentes
  ↓
Store (Zustand) → Filtros → UI
```

## 🎨 Sistema de Diseño

### Colores

- **Primario**: `#00C9FF` (Cian)
- **Secundario**: `#00A89C` (Teal)
- **Error**: `#FF3B30` (Rojo)
- **Warning**: `#FFA726` (Naranja)
- **Success**: `#66BB6A` (Verde)

### Animaciones

- **Duración estándar**: 300ms
- **Easing**: `easeInOut`
- **Stagger**: 100ms entre elementos

## 🚀 Próximas Mejoras

1. **Testing**: Añadir tests unitarios y de integración
2. **Storybook**: Documentación interactiva de componentes
3. **PWA**: Funcionalidad offline
4. **Internacionalización**: Soporte multiidioma
5. **Accesibilidad**: Mejoras de a11y

## 📝 Convenciones de Código

### Naming

- **Componentes**: PascalCase (`StatsCard`)
- **Hooks**: camelCase con prefijo `use` (`useFilters`)
- **Utilidades**: camelCase (`normalizeGravedad`)
- **Constantes**: UPPER_SNAKE_CASE (`API_CONFIG`)

### Estructura de Archivos

- **Un componente por archivo**
- **Hooks en carpeta separada**
- **Utilidades agrupadas por funcionalidad**
- **Tipos en carpeta dedicada**

### Comentarios

- **JSDoc** para funciones públicas
- **Comentarios inline** para lógica compleja
- **README** en cada carpeta importante
