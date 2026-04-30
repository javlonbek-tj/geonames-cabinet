import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { RegistryParams } from '@/api/geographic-objects.api';

const DEFAULT_LIMIT = 10;

export function useRegistryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<RegistryParams>(
    () => ({
      page: Number(searchParams.get('page') || 1),
      limit: Number(searchParams.get('limit') || DEFAULT_LIMIT),
      search: searchParams.get('search') || undefined,
      regionId: searchParams.get('regionId')
        ? Number(searchParams.get('regionId'))
        : undefined,
      districtId: searchParams.get('districtId')
        ? Number(searchParams.get('districtId'))
        : undefined,
      categoryId: searchParams.get('categoryId')
        ? Number(searchParams.get('categoryId'))
        : undefined,
      objectTypeId: searchParams.get('objectTypeId')
        ? Number(searchParams.get('objectTypeId'))
        : undefined,
    }),
    [searchParams],
  );

  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || '',
  );

  const setFilters = useCallback(
    (updater: RegistryParams | ((prev: RegistryParams) => RegistryParams)) => {
      const next = typeof updater === 'function' ? updater(filters) : updater;
      const params = new URLSearchParams();
      if (next.page && next.page !== 1) params.set('page', String(next.page));
      if (next.limit && next.limit !== DEFAULT_LIMIT)
        params.set('limit', String(next.limit));
      if (next.search) params.set('search', next.search);
      if (next.regionId) params.set('regionId', String(next.regionId));
      if (next.districtId) params.set('districtId', String(next.districtId));
      if (next.categoryId) params.set('categoryId', String(next.categoryId));
      if (next.objectTypeId)
        params.set('objectTypeId', String(next.objectTypeId));
      setSearchParams(params, { replace: true });
    },
    [filters, setSearchParams],
  );

  const applySearch = useCallback(() => {
    setFilters((f) => ({ ...f, page: 1, search: searchInput || undefined }));
  }, [searchInput, setFilters]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const hasFilters =
    !!filters.search ||
    !!filters.regionId ||
    !!filters.districtId ||
    !!filters.categoryId ||
    !!filters.objectTypeId;

  return {
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    applySearch,
    clearFilters,
    hasFilters,
  };
}
