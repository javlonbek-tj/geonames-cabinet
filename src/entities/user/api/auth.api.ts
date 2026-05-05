import api from '@/shared/api/axios';
import type { AuthResponse } from '@/entities/user/model/auth.types'
import type { ApiResponse, ApiMessage } from '@/shared/types/common';
import type { LoginSchema, ChangePasswordSchema } from '@/shared/lib/schemas/auth.schema';

export const authApi = {
  login: async (data: LoginSchema) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  logout: () => api.post<ApiMessage>('/auth/logout'),

  me: () => api.get<ApiResponse<AuthResponse>>('/auth/me'),

  changePassword: (data: ChangePasswordSchema) =>
    api.patch<ApiMessage>('/auth/change-password', data),
};
