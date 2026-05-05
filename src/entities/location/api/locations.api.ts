import api from '@/shared/api/axios';
import type { Region, District } from '@/entities/location/model/types'
import type { ApiResponse } from '@/shared/types/common';

export const locationsApi = {
  getRegions: () =>
    api.get<ApiResponse<Region[]>>('/locations/regions'),

  getDistricts: (regionId?: number) =>
    api.get<ApiResponse<District[]>>('/locations/districts', {
      params: regionId ? { regionId } : undefined,
    }),
};
