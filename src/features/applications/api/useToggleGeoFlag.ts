import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/entities/geo-flag/api/geo-flags.api';

export function useToggleGeoFlag(applicationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      geoObjectId,
      comment,
    }: {
      geoObjectId: number;
      comment?: string;
    }) => api.toggleGeoFlag(applicationId, geoObjectId, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['geo-flags', applicationId] });
    },
  });
}
