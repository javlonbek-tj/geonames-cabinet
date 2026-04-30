import { Input, Select, Button, Card } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import { useAdminCategories } from '@/hooks/admin/useObjectTypes';
import { useAuthStore } from '@/store/authStore';
import type { RegistryParams } from '@/api/geographic-objects.api';

interface Props {
  filters: RegistryParams;
  setFilters: (
    updater: RegistryParams | ((prev: RegistryParams) => RegistryParams),
  ) => void;
  searchInput: string;
  setSearchInput: (v: string) => void;
  applySearch: () => void;
  clearFilters: () => void;
  hasFilters: boolean;
  isDistrictRole: boolean;
  isRegionalRole: boolean;
}

export default function RegistryFilters({
  filters,
  setFilters,
  searchInput,
  setSearchInput,
  applySearch,
  clearFilters,
  hasFilters,
  isDistrictRole,
  isRegionalRole,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: regions = [] } = useRegions();
  const districtRegionId = isRegionalRole
    ? (user?.regionId ?? undefined)
    : filters.regionId;
  const { data: filterDistricts = [] } = useDistricts(districtRegionId);
  const { data: categories = [] } = useAdminCategories();

  const selectedCategoryId = filters.categoryId;
  const typeOptions =
    categories.find((c) => c.id === selectedCategoryId)?.objectTypes ?? [];

  return (
    <Card size='small'>
      <div className='flex flex-wrap gap-2 items-end'>
        <div className='flex-1 min-w-48'>
          <div className='text-xs text-gray-500 mb-1'>Qidirish</div>
          <Input.Search
            placeholder="Nom yoki reyestr raqami bo'yicha..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={applySearch}
            onClear={() => {
              setSearchInput('');
              setFilters((f) => ({ ...f, page: 1, search: undefined }));
            }}
            allowClear
          />
        </div>
        {!isDistrictRole && !isRegionalRole && (
          <div className='w-44'>
            <div className='text-xs text-gray-500 mb-1'>Viloyat</div>
            <Select
              placeholder='Barchasi'
              allowClear
              className='w-full'
              value={filters.regionId}
              options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  page: 1,
                  regionId: v,
                  districtId: undefined,
                }))
              }
            />
          </div>
        )}
        {!isDistrictRole && (
          <div className='w-44'>
            <div className='text-xs text-gray-500 mb-1'>Tuman</div>
            <Select
              placeholder='Barchasi'
              allowClear
              className='w-full'
              disabled={!isRegionalRole && !filters.regionId}
              value={filters.districtId}
              options={filterDistricts.map((d) => ({
                value: d.id,
                label: d.nameUz,
              }))}
              onChange={(v) =>
                setFilters((f) => ({ ...f, page: 1, districtId: v }))
              }
            />
          </div>
        )}
        <div className='w-48'>
          <div className='text-xs text-gray-500 mb-1'>Guruh</div>
          <Select
            placeholder='Barchasi'
            allowClear
            className='w-full'
            value={selectedCategoryId}
            options={categories.map((c) => ({
              value: c.id,
              label: c.code ? `[${c.code}] ${c.nameUz}` : c.nameUz,
            }))}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                page: 1,
                categoryId: v,
                objectTypeId: undefined,
              }))
            }
          />
        </div>
        <div className='w-48'>
          <div className='text-xs text-gray-500 mb-1'>Tur</div>
          <Select
            placeholder='Barchasi'
            allowClear
            className='w-full'
            disabled={!selectedCategoryId}
            value={filters.objectTypeId}
            options={typeOptions.map((t) => ({ value: t.id, label: t.nameUz }))}
            onChange={(v) =>
              setFilters((f) => ({ ...f, page: 1, objectTypeId: v }))
            }
          />
        </div>
        <div>
          <div className='text-xs text-gray-500 mb-1 invisible'>.</div>
          <Button
            icon={<ClearOutlined />}
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            Tozalash
          </Button>
        </div>
      </div>
    </Card>
  );
}
