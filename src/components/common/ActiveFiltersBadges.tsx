/**
 * Componente para mostrar badges con los filtros activos seleccionados
 */

import React from 'react';
import {
  Business as BusinessIcon,
  Warning as WarningIcon,
  Timeline as ImpactIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { GRAVEDAD_OPTIONS } from '../../constants';
import { useSettingsStore } from '../../store/settings';

export const ActiveFiltersBadges: React.FC = () => {
  const { filters, setFilters } = useSettingsStore();

  const hasFilters =
    filters.gravedad.length > 0 ||
    filters.dependencia.length > 0 ||
    (filters.comuna && filters.comuna.length > 0) ||
    filters.impacto.length > 0 ||
    filters.searchTerm ||
    filters.priorityProject;

  if (!hasFilters) {
    return null;
  }

  const handleRemoveGravedad = (gravedad: string) => {
    const newGravedades = filters.gravedad.filter(g => g !== gravedad);
    setFilters({ gravedad: newGravedades });
  };

  const handleRemoveDependencia = (dependencia: string) => {
    const newDependencias = filters.dependencia.filter(d => d !== dependencia);
    setFilters({ dependencia: newDependencias });
  };

  const handleRemoveComuna = (comuna: string) => {
    const newComunas = (filters.comuna || []).filter(c => c !== comuna);
    setFilters({ comuna: newComunas });
  };

  const handleRemoveImpacto = (impacto: string) => {
    const newImpactos = filters.impacto.filter(i => i !== impacto);
    setFilters({ impacto: newImpactos });
  };

  const handleRemoveSearch = () => {
    setFilters({ searchTerm: '' });
  };

  const handleRemoveProject = () => {
    setFilters({ priorityProject: '' });
  };

  const getGravedadLabel = (key: string) => {
    const option = GRAVEDAD_OPTIONS.find(g => g.key === key);
    return option?.label || key;
  };

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {/* Búsqueda */}
      {filters.searchTerm && (
        <span className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-300'>
          <SearchIcon className='w-4 h-4' />
          <span className='max-w-[150px] truncate' title={filters.searchTerm}>
            {filters.searchTerm}
          </span>
          <button
            onClick={handleRemoveSearch}
            className='ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors'
            title='Quitar búsqueda'
          >
            <CloseIcon className='w-3 h-3' />
          </button>
        </span>
      )}

      {/* Proyecto estratégico */}
      {filters.priorityProject && (
        <span className='inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-300'>
          <AssignmentIcon className='w-4 h-4' />
          <span className='max-w-[150px] truncate' title={filters.priorityProject}>
            {filters.priorityProject}
          </span>
          <button
            onClick={handleRemoveProject}
            className='ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors'
            title='Quitar proyecto'
          >
            <CloseIcon className='w-3 h-3' />
          </button>
        </span>
      )}

      {/* Gravedades */}
      {filters.gravedad.map(gravedad => (
        <span
          key={gravedad}
          className='inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-300'
        >
          <WarningIcon className='w-4 h-4' />
          {getGravedadLabel(gravedad)}
          <button
            onClick={() => handleRemoveGravedad(gravedad)}
            className='ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors'
            title='Quitar gravedad'
          >
            <CloseIcon className='w-3 h-3' />
          </button>
        </span>
      ))}

      {/* Dependencias */}
      {filters.dependencia.map(dependencia => (
        <span
          key={dependencia}
          className='inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-medium border border-indigo-300 max-w-xs'
          title={dependencia}
        >
          <BusinessIcon className='w-3.5 h-3.5 flex-shrink-0' />
          <span className='truncate'>{dependencia}</span>
          <button
            onClick={() => handleRemoveDependencia(dependencia)}
            className='ml-1 hover:bg-indigo-200 rounded-full p-0.5 transition-colors flex-shrink-0'
            title='Quitar dependencia'
          >
            <CloseIcon className='w-3 h-3' />
          </button>
        </span>
      ))}

      {/* Impactos */}
      {filters.impacto.map(impacto => (
        <span
          key={impacto}
          className='inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-300 capitalize'
        >
          <ImpactIcon className='w-4 h-4' />
          {impacto}
          <button
            onClick={() => handleRemoveImpacto(impacto)}
            className='ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors'
            title='Quitar impacto'
          >
            <CloseIcon className='w-3 h-3' />
          </button>
        </span>
      ))}

      {/* Comunas */}
      {(filters.comuna || []).map(comuna => (
        <span
          key={comuna}
          className='inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-xs font-medium border border-green-300 max-w-xs'
          title={comuna}
        >
          <LocationIcon className='w-3.5 h-3.5 flex-shrink-0' />
          <span className='truncate'>{comuna}</span>
          <button
            onClick={() => handleRemoveComuna(comuna)}
            className='ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors flex-shrink-0'
            title='Quitar comuna'
          >
            <CloseIcon className='w-3 h-3' />
          </button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFiltersBadges;

