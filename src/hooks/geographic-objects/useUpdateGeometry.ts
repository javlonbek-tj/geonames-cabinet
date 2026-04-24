import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { geographicObjectsApi } from '@/api/geographic-objects.api';

type ApiError = { response?: { data?: { message?: string } } };

export function useUpdateGeometry(objectId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (geometry: object) =>
      geographicObjectsApi.updateGeometry(objectId, geometry),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['geographic-object', objectId] });
      void message.success('Geometriya muvaffaqiyatli yangilandi');
    },
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
