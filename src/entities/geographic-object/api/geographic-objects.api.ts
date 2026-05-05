import api from '@/shared/api/axios';
import type { Application } from '@/entities/application/model/types'
import type { GeographicObject } from '@/entities/geographic-object/model/types'
import type { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import type { CreateGeographicObjectSchema } from '@/shared/lib/schemas/geographic-object.schema';

export interface RegistryParams {
  page?: number;
  limit?: number;
  search?: string;
  regionId?: number;
  districtId?: number;
  objectTypeId?: number;
  categoryId?: number;
}

export const geographicObjectsApi = {
  getRegistry: (params?: RegistryParams) =>
    api.get<PaginatedResponse<GeographicObject>>('/geographic-objects/registry', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<GeographicObject>>(`/geographic-objects/${id}`),

  create: (data: CreateGeographicObjectSchema) =>
    api.post<ApiResponse<{ application: Application; geographicObjects: GeographicObject[] }>>(
      '/geographic-objects',
      data,
    ),

  updateRegistryObject: (id: number, data: Partial<GeographicObject>) =>
    api.patch<ApiResponse<GeographicObject>>(`/geographic-objects/${id}`, data),

  deleteRegistryObject: (id: number) =>
    api.delete(`/geographic-objects/${id}`),

  updateNames: (
    applicationId: number,
    objects: Array<{ id: number; nameUz: string; nameKrill?: string }>,
  ) =>
    api.patch<ApiResponse<{ message: string }>>(
      `/geographic-objects/by-application/${applicationId}/names`,
      { objects },
    ),

  updateGeometry: (id: number, geometry: object) =>
    api.patch<ApiResponse<GeographicObject>>(
      `/geographic-objects/${id}/geometry`,
      { geometry },
    ),
};
