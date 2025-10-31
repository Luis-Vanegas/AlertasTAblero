/**
 * Hook para manejar filtros desde parámetros de URL
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSettingsStore } from '../store/settings';
import { normalizeProjectName } from '../utils/textNormalize';

export const useUrlFilters = () => {
  const [searchParams] = useSearchParams();
  const { setFilters } = useSettingsStore();

  useEffect(() => {
    const proyectoParam = searchParams.get('proyecto');

    if (proyectoParam) {
      const decodedProject = decodeURIComponent(proyectoParam);
      const normalizedProject = normalizeProjectName(decodedProject);
      setFilters({ priorityProject: normalizedProject });
    } else {
      setFilters({ priorityProject: '' });
    }
  }, [searchParams, setFilters]);
};
