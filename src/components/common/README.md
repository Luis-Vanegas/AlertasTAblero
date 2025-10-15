# Componentes de Dashboard Moderno

Este directorio contiene los componentes rediseñados para el dashboard de métricas de proyectos, utilizando Tailwind CSS para un diseño moderno, responsive y profesional.

## Componentes Principales

### 1. MetricCard

Tarjeta individual para mostrar métricas con:

- Diseño moderno con gradientes y efectos de hover
- Iconos personalizados
- Indicadores de tendencia
- Animaciones suaves
- Estados de selección

### 2. MetricsGrid

Contenedor para organizar múltiples tarjetas de métricas:

- Grid responsive (1-5 columnas según el tamaño de pantalla)
- Animaciones escalonadas
- Header opcional con título y subtítulo

### 3. ExecutiveSummary

Resumen ejecutivo compacto con:

- Vista general de todas las métricas importantes
- Diseño en grid compacto
- Indicadores visuales de estado
- Interactividad para filtrado

### 4. StatusIndicator

Indicador de estado con barra de progreso:

- Múltiples estados (success, warning, error, info)
- Barras de progreso animadas
- Diferentes tamaños (sm, md, lg)
- Porcentajes y valores absolutos

### 5. CompactDashboard

Dashboard completo compacto que combina:

- Todas las métricas en una vista
- Indicadores de progreso
- Barra de progreso general
- Diseño optimizado para pantallas pequeñas

## Características del Diseño

### Responsive Design

- **Mobile First**: Optimizado para dispositivos móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid Adaptativo**: Se ajusta automáticamente al tamaño de pantalla

### Colores y Temas

- **Paleta Consistente**: Colores definidos en tailwind.config.js
- **Estados Semánticos**: success, warning, error, info, primary
- **Gradientes Suaves**: Efectos visuales modernos

### Animaciones

- **Framer Motion**: Animaciones fluidas y profesionales
- **Hover Effects**: Interacciones visuales atractivas
- **Loading States**: Transiciones suaves al cargar

### Accesibilidad

- **Focus States**: Indicadores claros de foco
- **Contraste**: Colores con suficiente contraste
- **Screen Readers**: Textos descriptivos apropiados

## Uso

```tsx
import MetricsGrid from './components/common/MetricsGrid';
import MetricCard from './components/common/MetricCard';

// Ejemplo de uso
<MetricsGrid
  title='Métricas de Proyectos'
  subtitle='Análisis financiero y temporal'
  metrics={[
    {
      id: 'budget',
      title: 'Cambios > 500M',
      description: 'Proyectos con incrementos presupuestales',
      value: 149,
      color: 'danger',
      icon: <TrendingUpIcon />,
      onClick: () => handleFilter('budget'),
      trend: { value: 12, isPositive: false },
    },
  ]}
/>;
```

## Personalización

### Colores

Los colores se pueden personalizar en `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* ... */ },
      success: { /* ... */ },
      warning: { /* ... */ },
      danger: { /* ... */ },
      info: { /* ... */ }
    }
  }
}
```

### Animaciones

Las animaciones se pueden personalizar en `src/index.css`:

```css
.metric-card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Mejoras Implementadas

1. **Diseño Más Compacto**: Menor uso de espacio vertical
2. **Mejor Legibilidad**: Tipografía optimizada y contrastes mejorados
3. **Responsive Mejorado**: Adaptación perfecta a todos los dispositivos
4. **Interactividad**: Efectos hover y estados de selección
5. **Performance**: Animaciones optimizadas y componentes ligeros
6. **Mantenibilidad**: Código modular y reutilizable
