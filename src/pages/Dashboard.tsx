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
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import { useAlertas, useAlertasStats } from '../hooks/useAlertas';
import { useFilters } from '../hooks/useFilters';
import { useProjectMetrics } from '../hooks/useProjectMetrics';
import { useCambiosFechasEstimadas, useCambiosPresupuesto } from '../hooks/useHistorico';
import { useSettingsStore } from '../store/settings';
import { MappedAlerta } from '../types/api';
import DetailDrawer from '../components/DetailDrawer';
import { ANIMATION_VARIANTS, ROUTES } from '../constants';

// Componentes del Dashboard
import MetricsPanel from '../components/dashboard/MetricsPanel';
import ProjectList from '../components/dashboard/ProjectList';
import ChangesList from '../components/dashboard/ChangesList';
import DependencyGroup from '../components/dashboard/DependencyGroup';
import LoadingState from '../components/dashboard/LoadingState';
import EmptyState from '../components/dashboard/EmptyState';
import ScrollToTopButton from '../components/dashboard/ScrollToTopButton';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Store de configuración y filtros
  const { filters, setFilters } = useSettingsStore();

  // Estado local del componente
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAlerta, setSelectedAlerta] = useState<MappedAlerta | null>(null);
  const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
  const [showCambiosFechas, setShowCambiosFechas] = useState(false);
  const [showCambiosPresupuesto, setShowCambiosPresupuesto] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const resultsAnchorRef = useRef<HTMLDivElement | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement | null>(null);

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
   * Controla la visibilidad del botón de volver arriba basado en el scroll del panel de resultados
   */
  useEffect(() => {
    const container = resultsContainerRef.current;
    if (!container || !showResults) {
      setShowBackToTop(false);
      return;
    }

    const handleScroll = () => {
      // Mostrar el botón cuando se haya desplazado más de 200px hacia abajo
      setShowBackToTop(container.scrollTop > 200);
    };

    // Ejecutar inmediatamente para verificar el estado inicial
    handleScroll();

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [showResults]);

  /**
   * Función para hacer scroll a la parte superior del panel de resultados
   */
  const scrollToResults = () => {
    resultsContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
    // Hacer scroll hacia arriba del panel de resultados
    scrollToResults();
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
    <div className='w-full flex flex-col pb-4'>
      {/* Botón de volver - Responsive */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate(ROUTES.HOME)}
        className='mb-2 sm:mb-3 flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex-shrink-0 text-responsive'
      >
        <ArrowBackIcon className='w-4 h-4 sm:w-5 sm:h-5' />
        <span className='font-medium'>Volver a Inicio</span>
      </motion.button>

      {/* Layout de dos columnas: Métricas (izquierda) y Resultados (derecha) - Misma altura con scroll interno */}
      <div className='grid grid-cols-1 md:grid-cols-[minmax(240px,280px)_1fr] lg:grid-cols-[minmax(260px,320px)_1fr] xl:grid-cols-[minmax(280px,360px)_1fr] 2xl:grid-cols-[minmax(300px,400px)_1fr] gap-2 sm:gap-3 lg:gap-4 items-start md:items-stretch'>
        {/* Columna Izquierda - Métricas */}
        <motion.div
          variants={ANIMATION_VARIANTS.item}
          initial='hidden'
          animate='visible'
          className='flex flex-col md:h-full'
        >
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
        </motion.div>

        {/* Columna Derecha - Resultados con scroll interno solo en desktop */}
        <motion.div
          variants={ANIMATION_VARIANTS.item}
          initial='hidden'
          animate='visible'
          className='flex flex-col md:h-full'
        >
          <div className='bg-white rounded-xl border-2 border-gray-200 shadow-lg flex flex-col h-full overflow-hidden'>
            {/* Header del panel de resultados - Responsive y fijo */}
            <div className='p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 border-b border-gray-200 flex-shrink-0 bg-white'>
              <h2 className='text-responsive-lg font-bold text-gray-800'>Resultados</h2>
              <p className='text-responsive-sm text-gray-600 mt-1'>
                {hasActiveFilters
                  ? `${filteredAlertas.length} alerta${filteredAlertas.length !== 1 ? 's' : ''} encontrada${filteredAlertas.length !== 1 ? 's' : ''}`
                  : `${totalAlertas} alerta${totalAlertas !== 1 ? 's' : ''} en total`}
              </p>
            </div>

            {/* Contenido scrollable - Scroll interno funcional */}
            <div
              ref={resultsContainerRef}
              className='flex-1 overflow-y-scroll overflow-x-hidden p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 min-h-0'
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: '#888 #f1f1f1',
              }}
            >
              {/* Ancla para scroll a resultados */}
              <div ref={resultsAnchorRef} />

              {/* Estado vacío cuando no hay filtros */}
              {!hasActiveFilters && (
                <EmptyState
                  hasActiveFilters={hasActiveFilters}
                  showResults={showResults}
                  totalAlertas={totalAlertas}
                />
              )}

              {/* Lista de Proyectos Tardíos */}
              {activeFilterType === 'late' &&
                projectMetrics?.lateProjects.projects &&
                projectMetrics.lateProjects.projects.length > 0 && (
                  <div className='pb-4'>
                    <ProjectList
                      title='Proyectos que terminan después de 01/07/2027'
                      description='Información detallada de las obras con fecha de entrega estimada después del 01/07/2027'
                      projects={projectMetrics.lateProjects.projects}
                      itemsPerPage={20}
                      onClose={handleCloseMetricFilter}
                    />
                  </div>
                )}

              {/* Lista de Proyectos Pendientes de Definición */}
              {activeFilterType === 'definition' &&
                projectMetrics?.pendingDefinitionProjects.projects &&
                projectMetrics.pendingDefinitionProjects.projects.length > 0 && (
                  <div className='pb-4'>
                    <ProjectList
                      title='Proyectos Pendientes de Definición'
                      description='Información detallada de las obras con estado pausado'
                      projects={projectMetrics.pendingDefinitionProjects.projects}
                      itemsPerPage={20}
                      onClose={handleCloseMetricFilter}
                    />
                  </div>
                )}

              {/* Lista de Cambios de Fechas */}
              {showCambiosFechas && cambiosFechasLista && cambiosFechasLista.length > 0 && (
                <div className='pb-4'>
                  <ChangesList
                    title='Cambios de fechas estimadas de entrega'
                    description='Proyectos con cambios de fecha mayores a 2 meses'
                    cambios={cambiosFechasLista}
                    tipo='fechas'
                    itemsPerPage={20}
                    onClose={handleCloseChangesPanels}
                  />
                </div>
              )}

              {/* Lista de Cambios de Presupuesto */}
              {showCambiosPresupuesto &&
                cambiosPresupuestoLista &&
                cambiosPresupuestoLista.length > 0 && (
                  <div className='pb-4'>
                    <ChangesList
                      title='Cambios de Presupuesto'
                      description='Proyectos con incrementos presupuestales mayores a 500M'
                      cambios={cambiosPresupuestoLista}
                      tipo='presupuesto'
                      itemsPerPage={20}
                      onClose={handleCloseChangesPanels}
                    />
                  </div>
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
                        <h3 className='text-lg font-semibold text-gray-800'>
                          No se encontraron alertas
                        </h3>
                        <p className='text-sm text-gray-600 mt-1'>
                          Total alertas: {alertas.length} | Filtradas: {filteredAlertas.length} |
                          Grupos: {alertasPorDependencia.length}
                        </p>
                        <p className='text-sm text-gray-600 mt-1'>
                          Búsqueda: "{filters.searchTerm}" | Dep: "
                          {filters.dependencia?.join(', ') || 'Todas'}" | Sev: "
                          {filters.gravedad?.join(', ') || 'Todas'}"
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className='space-y-4 md:space-y-6 pb-4'>
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
                          onViewDetails={openDetail}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Botón flotante para volver arriba */}
      <ScrollToTopButton visible={showResults && showBackToTop} onScrollToTop={scrollToResults} />

      {/* Drawer de detalles de alerta */}
      <DetailDrawer open={detailOpen} onClose={closeDetail} alerta={selectedAlerta} />
    </div>
  );
};

export default Dashboard;
