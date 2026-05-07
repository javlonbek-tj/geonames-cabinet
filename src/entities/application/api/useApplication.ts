import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '@/entities/application/api/applications.api';
import { applicationKeys } from './useApplications';

export function useApplication(id: number) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationsApi.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useAvailableActions(id: number) {
  return useQuery({
    queryKey: applicationKeys.actions(id),
    queryFn: () => applicationsApi.getAvailableActions(id).then((res) => res.data.data),
    enabled: !!id,
  });
}
