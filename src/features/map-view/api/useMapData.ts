import { useQuery } from '@tanstack/react-query';
import { mapApi } from '@/features/map-view/api/map.api';
import type { RegistryObjectsParams } from '@/features/map-view/api/map.api';

export function useMapRegions() {
  return useQuery({
    queryKey: ['map', 'regions'],
    queryFn: () => mapApi.getRegions().then((r) => r.data.data),
    staleTime: Infinity,
  });
}

export function useMapDistricts(regionId: number | null) {
  return useQuery({
    queryKey: ['map', 'districts', regionId],
    queryFn: () => mapApi.getDistricts(regionId!).then((r) => r.data.data),
    enabled: regionId !== null,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMapRegistryObjects(params: RegistryObjectsParams) {
  return useQuery({
    queryKey: ['map', 'registry-objects', params],
    queryFn: () => mapApi.getRegistryObjects(params).then((r) => r.data.data),
    enabled: params.typeIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
