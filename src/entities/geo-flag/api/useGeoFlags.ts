import { useQuery } from '@tanstack/react-query';
import * as api from '@/entities/geo-flag/api/geo-flags.api';

export function useApplicationFlags(applicationId: number) {
  return useQuery({
    queryKey: ['geo-flags', applicationId],
    queryFn: () => api.getApplicationFlags(applicationId),
    enabled: applicationId > 0,
  });
}

export function useNonCompliantList(params?: {
  regionId?: number;
  districtId?: number;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['non-compliant', params],
    queryFn: () => api.listNonCompliant(params),
    placeholderData: (prev) => prev,
  });
}
