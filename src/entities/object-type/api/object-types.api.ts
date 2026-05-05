import api from '@/shared/api/axios';
import type { ObjectCategory, ObjectType } from '@/entities/object-type/model/types'
import type { ApiResponse } from '@/shared/types/common';

export const objectTypesApi = {
  getCategories: () =>
    api.get<ApiResponse<ObjectCategory[]>>('/admin/object-categories'),

  getTypes: (categoryId?: number) =>
    api.get<ApiResponse<ObjectType[]>>('/admin/object-types', {
      params: categoryId ? { categoryId } : undefined,
    }),
};
