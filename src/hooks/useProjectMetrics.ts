import { useQuery } from '@tanstack/react-query';
import { projectMetricsService, ProjectMetrics } from '../services/projectMetrics';

export const useProjectMetrics = () => {
  const query = useQuery<ProjectMetrics>({
    queryKey: ['project-metrics'],
    queryFn: () => projectMetricsService.getProjectMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  return {
    metrics: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
