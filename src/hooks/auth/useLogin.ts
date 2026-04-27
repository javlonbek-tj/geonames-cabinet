import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { App } from 'antd';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import type { LoginSchema } from '@/lib/schemas/auth.schema';

type ApiError = {
  response?: {
    status?: number;
    data?: { message?: string };
    headers?: Record<string, string>;
  };
};

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { message } = App.useApp();
  const [countdown, setCountdown] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = (seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCountdown(seconds);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const mutation = useMutation({
    mutationFn: (data: LoginSchema) => authApi.login(data),
    onSuccess: ({ data }) => {
      setAuth(data.data.accessToken, data.data.user);
      queryClient.clear();
      void navigate('/');
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 429) {
        const seconds = parseInt(error.response.headers?.['retry-after'] ?? '60');
        startCountdown(seconds);
      } else {
        void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
      }
    },
  });

  return { ...mutation, countdown };
}
