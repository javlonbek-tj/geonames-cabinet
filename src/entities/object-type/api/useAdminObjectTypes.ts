import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/entities/user/api/admin.api';

const KEY = ['admin', 'object-types'];

export function useAdminCategories() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => adminApi.getCategories().then((r) => r.data.data),
  });
}
