import api from './axios';

export interface MapFeature {
  type: 'Feature';
  geometry: object;
  properties: {
    id: number;
    nameUz: string | null;
    soato: string | null;
    regionId: number;
    districtId: number;
    regionDbId?: number;
    districtDbId?: number;
    objectType?: string | null;
    objectTypeId?: number | null;
    isMfy?: boolean;
    isStreet?: boolean;
  };
}

export interface MapFeatureCollection {
  type: 'FeatureCollection';
  features: MapFeature[];
}

export interface RegistryObjectsParams {
  typeIds: number[];
  regionId?: number | null;
  districtId?: number | null;
}

export const mapApi = {
  getRegions: () =>
    api.get<{ status: string; data: MapFeatureCollection }>('/map/regions'),

  getDistricts: (regionId: number) =>
    api.get<{ status: string; data: MapFeatureCollection }>(
      `/map/regions/${regionId}/districts`,
    ),

  getRegistryObjects: (params: RegistryObjectsParams) =>
    api.get<{ status: string; data: MapFeatureCollection }>(
      '/map/registry-objects',
      {
        params: {
          ...(params.typeIds.length > 0 && {
            typeIds: params.typeIds.join(','),
          }),
          ...(params.regionId && { regionId: params.regionId }),
          ...(params.districtId && { districtId: params.districtId }),
        },
      },
    ),
};
