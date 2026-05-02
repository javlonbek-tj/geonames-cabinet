import { Select, Spin } from 'antd';
import {
  EnvironmentOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import { useAdminCategories } from '@/hooks/admin/useObjectTypes';

// Shown via geometry layers — disable in the type select so user doesn't double-add
const BOUNDARY_TYPE_NAMES = new Set(['Viloyat', 'Tuman']);

interface Props {
  selectedRegionId: number | null;
  selectedDistrictId: number | null;
  onRegionChange: (id: number | null) => void;
  onDistrictChange: (id: number | null) => void;
  selectedCategoryId: number | null;
  selectedTypeIds: number[];
  onCategoryChange: (id: number | null) => void;
  onTypeIdsChange: (ids: number[]) => void;
  featureCounts: {
    regions: number;
    districts: number;
    mfy: number;
    streets: number;
    registry: number;
  };
  isLoading: boolean;
}

export default function MapFilterPanel({
  selectedRegionId,
  selectedDistrictId,
  onRegionChange,
  onDistrictChange,
  selectedCategoryId,
  selectedTypeIds,
  onCategoryChange,
  onTypeIdsChange,
  featureCounts,
  isLoading,
}: Props) {
  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(selectedRegionId ?? undefined);
  const { data: categories = [] } = useAdminCategories();

  const availableForCategory = selectedCategoryId
    ? (categories.find((c) => c.id === selectedCategoryId)?.objectTypes ?? [])
    : categories.flatMap((c) => c.objectTypes);

  const typeOptions = availableForCategory.map((t) => ({
    value: t.id,
    label: t.nameUz,
    disabled: BOUNDARY_TYPE_NAMES.has(t.nameUz),
  }));

  const hasDistrict = selectedDistrictId !== null;

  return (
    <div className='flex flex-col gap-4 h-full'>
      <div>
        <h2 className='text-sm font-bold text-[#0f1f3d] dark:text-gray-200 mb-3 uppercase tracking-wider'>
          Xarita filtri
        </h2>

        <div className='flex flex-col gap-3'>
          <div>
            <label className='text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block'>
              Viloyat
            </label>
            <Select
              placeholder='Barcha viloyatlar'
              allowClear
              className='w-full'
              value={selectedRegionId}
              options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
              onChange={(v) => {
                onRegionChange(v ?? null);
                onDistrictChange(null);
              }}
            />
          </div>

          <div>
            <label className='text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block'>
              Tuman
            </label>
            <Select
              placeholder={
                selectedRegionId ? 'Tuman tanlang' : 'Avval viloyat tanlang'
              }
              allowClear
              disabled={!selectedRegionId}
              className='w-full'
              value={selectedDistrictId}
              options={districts.map((d) => ({ value: d.id, label: d.nameUz }))}
              onChange={(v) => onDistrictChange(v ?? null)}
            />
          </div>
        </div>
      </div>

      {/* Object type filter */}
      <div className='border-t border-gray-100 dark:border-[#303030] pt-4 flex flex-col gap-3'>
        <h3 className='text-xs font-bold text-[#0f1f3d] dark:text-gray-200 uppercase tracking-wider'>
          Obyekt turlari
        </h3>

        <div>
          <label className='text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block'>
            Kategoriya
          </label>
          <Select
            placeholder={
              hasDistrict ? 'Kategoriya tanlang' : 'Avval tuman tanlang'
            }
            allowClear
            disabled={!hasDistrict}
            className='w-full'
            value={selectedCategoryId}
            options={categories.map((c) => ({
              value: c.id,
              label: c.nameUz,
            }))}
            onChange={(v) => {
              onCategoryChange(v ?? null);
              onTypeIdsChange([]);
            }}
          />
        </div>

        <div>
          <label className='text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block'>
            Turlar
          </label>
          <Select
            mode='multiple'
            placeholder={
              hasDistrict ? 'Turlarni tanlang' : 'Avval tuman tanlang'
            }
            allowClear
            disabled={!hasDistrict}
            className='w-full'
            maxTagCount='responsive'
            value={selectedTypeIds}
            options={typeOptions}
            onChange={onTypeIdsChange}
          />
        </div>
      </div>

      {/* Stats */}
      <div className='mt-2 flex flex-col gap-2'>
        <p className='text-xs text-gray-400 font-medium uppercase tracking-wider mb-1'>
          Xaritadagi obyektlar
        </p>
        {isLoading ? (
          <div className='flex justify-center py-2'>
            <Spin size='small' />
          </div>
        ) : (
          <>
            <StatRow
              icon={<EnvironmentOutlined />}
              color='#1565c0'
              label='Viloyatlar'
              count={featureCounts.regions}
            />
            <StatRow
              icon={<ApartmentOutlined />}
              color='#15803d'
              label='Tumanlar'
              count={featureCounts.districts}
            />
            <StatRow
              icon={<AppstoreOutlined />}
              color='#06b6d4'
              label='Mahallalar'
              count={featureCounts.mfy}
            />
            <StatRow
              icon={<AppstoreOutlined />}
              color='#ca8a04'
              label="Ko'chalar"
              count={featureCounts.streets}
            />
            <StatRow
              icon={<AppstoreOutlined />}
              color='#16a34a'
              label="Qo'shimcha"
              count={featureCounts.registry}
            />
          </>
        )}
      </div>
    </div>
  );
}

function StatRow({
  icon,
  color,
  label,
  count,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  count: number;
}) {
  if (count === 0) return null;
  return (
    <div className='flex items-center justify-between'>
      <span className='flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400'>
        <span style={{ color }}>{icon}</span>
        {label}
      </span>
      <span
        className='text-xs font-bold px-2 py-0.5 rounded-full'
        style={{ background: color + '18', color }}
      >
        {count}
      </span>
    </div>
  );
}
