import { useQuery } from '@tanstack/react-query';
import { adminApi, type UsersParams } from '@/entities/user/api/admin.api';

export function useUsers(params?: UsersParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}
