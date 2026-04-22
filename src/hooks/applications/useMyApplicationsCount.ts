import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '@/api/applications.api';

export function useMyApplicationsCount() {
  return useQuery({
    queryKey: ['applications', 'my-count'],
    queryFn: () => applicationsApi.getMyCount().then((res) => res.data.data.count),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}
