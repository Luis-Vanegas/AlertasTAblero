import { useQuery } from '@tanstack/react-query';
import { projectMetricsService, ProjectMetrics } from '../services/projectMetrics';

export const useProjectMetrics = () => {
  console.log('🔧 useProjectMetrics: Iniciando hook...');

  const query = useQuery<ProjectMetrics>({
    queryKey: ['project-metrics'],
    queryFn: () => {
      console.log('🔧 useProjectMetrics: Ejecutando queryFn...');
      return projectMetricsService.getProjectMetrics();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  console.log('🔧 useProjectMetrics: Estado del query:', {
    isLoading: query.isLoading,
    error: query.error,
    hasData: !!query.data,
    dataKeys: query.data ? Object.keys(query.data) : 'no data',
  });

  return {
    metrics: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
