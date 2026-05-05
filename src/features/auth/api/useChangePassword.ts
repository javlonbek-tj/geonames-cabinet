import { useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { authApi } from '@/entities/user/api/auth.api';
import type { ChangePasswordSchema } from '@/shared/lib/schemas/auth.schema';

type ApiError = {
  response?: { data?: { message?: string } };
};

export function useChangePassword(onSuccess: () => void) {
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (data: ChangePasswordSchema) => authApi.changePassword(data),
    onSuccess: () => {
      void message.success('Parol muvaffaqiyatli yangilandi');
      onSuccess();
    },
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
