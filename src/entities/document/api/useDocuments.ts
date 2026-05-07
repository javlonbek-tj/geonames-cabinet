import { useQuery } from '@tanstack/react-query';
import { uploadsApi } from '@/entities/document/api/uploads.api';

export const documentKeys = {
  list: (applicationId: number) => ['documents', applicationId] as const,
};

export function useDocuments(applicationId: number) {
  return useQuery({
    queryKey: documentKeys.list(applicationId),
    queryFn: () => uploadsApi.getDocuments(applicationId).then((res) => res.data.data),
    enabled: !!applicationId,
  });
}
