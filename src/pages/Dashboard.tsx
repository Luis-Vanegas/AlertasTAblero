/**
 * Dashboard Principal
 *
 * Componente principal que muestra el dashboard de alertas con:
 * - Panel de métricas (alertas generadas y reportadas)
 * - Listas de proyectos filtrados (tardíos, pendientes, cambios)
 * - Grupos de alertas por dependencia
 * - Detalle de alertas en drawer lateral
 *
 * @component
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { useAlertas, useAlertasStats } from '../hooks/useAlertas';
import { useFilters } from '../hooks/useFilters';
import { useProjectMetrics } from '../hooks/useProjectMetrics';
import { useCambiosFechasEstimadas, useCambiosPresupuesto } from '../hooks/useHistorico';
import { useSettingsStore } from '../store/settings';
import { MappedAlerta } from '../types/api';
import DetailDrawer from '../components/DetailDrawer';
import { ANIMATION_VARIANTS } from '../constants';

// Componentes del Dashboard
import MetricsPanel from '../components/dashboard/MetricsPanel';
import ProjectList from '../components/dashboard/ProjectList';
import ChangesList from '../components/dashboard/ChangesList';
import DependencyGroup from '../components/dashboard/DependencyGroup';
import LoadingState from '../components/dashboard/LoadingState';
import EmptyState from '../components/dashboard/EmptyState';
import ScrollToTopButton from '../components/dashboard/ScrollToTopButton';

const Dashboard: React.FC = () => {
  // Store de configuración y filtros
  const { filters, setFilters } = useSettingsStore();

  // Estado local del componente
  const [expandedDependencies, setExpandedDependencies] = useState<Set<string>>(new Set());
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlerta, setSelectedAlerta] = useState<MappedAlerta | null>(null);
  const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
  const [showCambiosFechas, setShowCambiosFechas] = useState(false);
  const [showCambiosPresupuesto, setShowCambiosPresupuesto] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const resultsAnchorRef = useRef<HTMLDivElement | null>(null);

  // Hooks para obtener datos
  const { alertas, isLoading, pagination } = useAlertas({ limit: 10000 });
  const { isLoading: loadingStats } = useAlertasStats();
  const { metrics: projectMetrics, isLoading: loadingMetrics } = useProjectMetrics();
  const {
    total_cambios: cambiosFechas,
    cambios: cambiosFechasLista,
    isLoading: loadingCambios,
  } = useCambiosFechasEstimadas();
  const {
    total_cambios: cambiosPresupuesto,
    cambios: cambiosPresupuestoLista,
    isLoading: loadingPresupuesto,
  } = useCambiosPresupuesto();

  // Hook de filtros para procesar y agrupar alertas
  const { filteredAlertas, alertasPorDependencia, alertStats } = useFilters({
    alertas,
    filters,
  });

  // Estado de carga combinado
  const loading =
    isLoading || loadingStats || loadingMetrics || loadingCambios || loadingPresupuesto;

  // Verificar si hay filtros activos
  const hasActiveFilters: boolean = Boolean(
    filters.gravedad.length > 0 ||
      filters.dependencia.length > 0 ||
      (filters.comuna && filters.comuna.length > 0) ||
      filters.impacto.length > 0 ||
      filters.searchTerm ||
      (filters.obraIds && filters.obraIds.length > 0)
  );

  // Total de alertas: usar el total real de la API cuando no hay filtros, o el total filtrado cuando hay filtros
  const totalAlertas = hasActiveFilters
    ? alertStats.total
    : (pagination?.total ?? alertStats.total);

  // Hay resultados visibles cuando existen filtros activos o se activan paneles de resultados
  const showResults: boolean =
    hasActiveFilters ||
    activeFilterType === 'late' ||
    activeFilterType === 'definition' ||
    showCambiosFechas ||
    showCambiosPresupuesto;

  /**
   * Controla la visibilidad del botón de volver arriba basado en el scroll
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Mostrar el botón cuando se haya desplazado más de 200px hacia abajo
      setShowBackToTop(scrollTop > 200);
    };

    // Ejecutar inmediatamente para verificar el estado inicial
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Recalcular la posición del scroll cuando cambie el contenido
   */
  useEffect(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setShowBackToTop(scrollTop > 200);
  }, [hasActiveFilters, activeFilterType, showCambiosFechas, showCambiosPresupuesto]);

  /**
   * Función para hacer scroll hacia abajo a los resultados
   */
  const scrollToResults = () => {
    // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const anchor = resultsAnchorRef.current;
        if (anchor) {
          const rect = anchor.getBoundingClientRect();
          const top = rect.top + window.pageYOffset - 120; // offset desde el top
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  };

  /**
   * Toggle de expansión de dependencias
   */
  const handleToggleExpand = (dependencia: string) => {
    const newExpanded = new Set(expandedDependencies);
    if (newExpanded.has(dependencia)) {
      newExpanded.delete(dependencia);
    } else {
      newExpanded.add(dependencia);
    }
    setExpandedDependencies(newExpanded);
  };

  /**
   * Abre el drawer de detalles de una alerta
   */
  const openDetail = (alerta: MappedAlerta) => {
    setSelectedAlerta(alerta);
    setDetailOpen(true);
  };

  /**
   * Cierra el drawer de detalles
   */
  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedAlerta(null);
  };

  /**
   * Maneja el filtro por gravedad desde las tarjetas de estadísticas
   */
  const handleCardFilter = (gravedad: string) => {
    // Al seleccionar tarjetas de "Alertas reportadas" cerrar cualquier panel de "Alertas generadas"
    setActiveFilterType(null);
    setShowCambiosFechas(false);
    setShowCambiosPresupuesto(false);

    const currentGravedades = filters.gravedad;
    const newGravedades = currentGravedades.includes(gravedad)
      ? currentGravedades.filter(g => g !== gravedad)
      : [...currentGravedades, gravedad];
    setFilters({ gravedad: newGravedades });

    // Hacer scroll hacia abajo después de que se renderice el contenido
    setTimeout(() => {
      scrollToResults();
    }, 200);
  };

  /**
   * Limpia todos los filtros activos
   */
  const handleClearAllFilters = () => {
    setFilters({
      gravedad: [],
      dependencia: [],
      comuna: [],
      impacto: [],
      searchTerm: '',
      obraIds: [],
      priorityProject: '',
    });
    // Resetear paneles de métricas y cambios
    setActiveFilterType(null);
    setShowCambiosFechas(false);
    setShowCambiosPresupuesto(false);
  };

  /**
   * Maneja el filtro por tipo de métrica
   * Limpia los filtros y muestra la lista correspondiente según el tipo seleccionado
   */
  const handleMetricFilter = (type: string) => {
    setActiveFilterType(type);
    // Siempre cerrar otros paneles de cambios al cambiar de métrica
    setShowCambiosFechas(false);
    setShowCambiosPresupuesto(false);

    switch (type) {
      case 'late':
      case 'definition':
      case 'defunded':
        // Limpiar filtros para estos tipos
        setFilters({
          gravedad: [],
          dependencia: [],
          comuna: [],
          impacto: [],
          searchTerm: '',
          obraIds: [],
          priorityProject: '',
        });
        break;
      case 'budget':
        setShowCambiosPresupuesto(true);
        break;
      case 'delayed2months':
        setShowCambiosFechas(true);
        break;
      default:
        break;
    }

    // Hacer scroll hacia abajo después de que se renderice el contenido
    setTimeout(() => {
      scrollToResults();
    }, 200);
  };

  /**
   * Cierra los paneles de cambios y resetea el tipo de filtro activo
   */
  const handleCloseChangesPanels = () => {
    setShowCambiosFechas(false);
    setShowCambiosPresupuesto(false);
    setActiveFilterType(null);
  };

  /**
   * Cierra un filtro específico de métrica
   */
  const handleCloseMetricFilter = () => {
    setActiveFilterType(null);
  };

  // Mostrar estado de carga
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className='min-h-screen px-4 sm:px-6 lg:px-8'>
      <motion.div
        variants={ANIMATION_VARIANTS.container}
        initial='hidden'
        animate='visible'
        className='space-y-6'
      >
        {/* Panel de Métricas */}
        <MetricsPanel
          {...(projectMetrics && {
            projectMetrics: {
              lateProjects: projectMetrics.lateProjects,
              pendingDefinitionProjects: projectMetrics.pendingDefinitionProjects,
            },
          })}
          cambiosPresupuesto={cambiosPresupuesto}
          cambiosFechas={cambiosFechas}
          alertStats={alertStats}
          activeFilterType={activeFilterType}
          hasActiveFilters={hasActiveFilters}
          selectedGravedades={filters.gravedad}
          onMetricFilter={handleMetricFilter}
          onCardFilter={handleCardFilter}
          onClearAllFilters={handleClearAllFilters}
        />

        {/* Ancla fija para scroll a resultados */}
        <div ref={resultsAnchorRef} />

        {/* Estado vacío cuando no hay filtros */}
        <EmptyState hasActiveFilters={hasActiveFilters} totalAlertas={totalAlertas} />

        {/* Lista de Proyectos Tardíos */}
        {activeFilterType === 'late' &&
          projectMetrics?.lateProjects.projects &&
          projectMetrics.lateProjects.projects.length > 0 && (
            <ProjectList
              title='Proyectos que terminan después de 01/07/2027'
              description='Información detallada de las obras con fecha de entrega estimada después del 01/07/2027'
              projects={projectMetrics.lateProjects.projects}
              itemsPerPage={20}
              onClose={handleCloseMetricFilter}
            />
          )}

        {/* Lista de Proyectos Pendientes de Definición */}
        {activeFilterType === 'definition' &&
          projectMetrics?.pendingDefinitionProjects.projects &&
          projectMetrics.pendingDefinitionProjects.projects.length > 0 && (
            <ProjectList
              title='Proyectos Pendientes de Definición'
              description='Información detallada de las obras con estado pausado'
              projects={projectMetrics.pendingDefinitionProjects.projects}
              itemsPerPage={20}
              onClose={handleCloseMetricFilter}
            />
          )}

        {/* Lista de Cambios de Fechas */}
        {showCambiosFechas && cambiosFechasLista && cambiosFechasLista.length > 0 && (
          <ChangesList
            title='Cambios de fechas estimadas de entrega'
            description='Proyectos con cambios de fecha mayores a 2 meses'
            cambios={cambiosFechasLista}
            tipo='fechas'
            itemsPerPage={20}
            onClose={handleCloseChangesPanels}
          />
        )}

        {/* Lista de Cambios de Presupuesto */}
        {showCambiosPresupuesto &&
          cambiosPresupuestoLista &&
          cambiosPresupuestoLista.length > 0 && (
            <ChangesList
              title='Cambios de Presupuesto'
              description='Proyectos con incrementos presupuestales mayores a 500M'
              cambios={cambiosPresupuestoLista}
              tipo='presupuesto'
              itemsPerPage={20}
              onClose={handleCloseChangesPanels}
            />
          )}

        {/* Lista de alertas por dependencia - Solo se muestra cuando hay filtros activos */}
        {hasActiveFilters && (
          <>
            {alertasPorDependencia.length === 0 ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
                  <h3 className='text-lg font-semibold text-gray-800'>No se encontraron alertas</h3>
                  <p className='text-sm text-gray-600 mt-1'>
                    Total alertas: {alertas.length} | Filtradas: {filteredAlertas.length} | Grupos:{' '}
                    {alertasPorDependencia.length}
                  </p>
                  <p className='text-sm text-gray-600 mt-1'>
                    Búsqueda: "{filters.searchTerm}" | Dep: "
                    {filters.dependencia?.join(', ') || 'Todas'}" | Sev: "
                    {filters.gravedad?.join(', ') || 'Todas'}"
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className='space-y-4 md:space-y-6'>
                {alertasPorDependencia.map(grupo => (
                  <DependencyGroup
                    key={grupo.dependencia}
                    dependencia={grupo.dependencia}
                    alertas={grupo.alertas}
                    stats={{
                      total: grupo.total,
                      altas: grupo.altas,
                      medias: grupo.medias,
                      leves: grupo.leves,
                      sinRiesgo: grupo.sinRiesgo || 0,
                    }}
                    isExpanded={expandedDependencies.has(grupo.dependencia)}
                    onToggleExpand={() => handleToggleExpand(grupo.dependencia)}
                    onViewDetails={openDetail}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Botón flotante para volver arriba */}
      <ScrollToTopButton visible={showResults && showBackToTop} />

      {/* Drawer de detalles de alerta */}
      <DetailDrawer open={detailOpen} onClose={closeDetail} alerta={selectedAlerta} />
    </div>
  );
};

export default Dashboard;
