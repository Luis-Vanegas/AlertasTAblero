import { useQuery } from '@tanstack/react-query';
import { obrasApiService, ObraExtra } from '../services/obrasApi';

export const useObraExtra = (obraId?: string | number) => {
  const query = useQuery<{ data: ObraExtra | null } | ObraExtra | null>({
    queryKey: ['obra-extra', obraId],
    queryFn: async () => {
      if (!obraId) {
        console.log('useObraExtra: No obraId provided');
        return null;
      }
      console.log('useObraExtra: Fetching data for obraId:', obraId);
      const data = await obrasApiService.getObraById(obraId);
      console.log('useObraExtra: Received data:', data);
      return data;
    },
    enabled: !!obraId,
    staleTime: 10 * 60 * 1000,
  });

  console.log('useObraExtra: Query state:', {
    obraId,
    isLoading: query.isLoading,
    error: query.error,
    data: query.data,
  });

  return {
    obraExtra: (query.data as ObraExtra | null) ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
