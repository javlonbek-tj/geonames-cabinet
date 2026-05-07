import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { applicationsApi } from '@/entities/application/api/applications.api';
import { applicationKeys } from '@/entities/application/api/useApplications';

export function usePerformAction(id: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (data: { action: string; comment?: string }) =>
      applicationsApi.performAction(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: applicationKeys.actions(id) });
      void queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      void message.success('Harakat muvaffaqiyatli bajarildi');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
