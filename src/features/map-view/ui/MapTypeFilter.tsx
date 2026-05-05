import { Select } from 'antd';
import { useAdminCategories } from '@/entities/object-type/api/useAdminObjectTypes';

const BOUNDARY_TYPE_NAMES = new Set(['Viloyat', 'Tuman']);

interface Props {
  selectedDistrictId: number | null;
  selectedCategoryId: number | null;
  selectedTypeIds: number[];
  onCategoryChange: (id: number | null) => void;
  onTypeIdsChange: (ids: number[]) => void;
}

export default function MapTypeFilter({
  selectedDistrictId,
  selectedCategoryId,
  selectedTypeIds,
  onCategoryChange,
  onTypeIdsChange,
}: Props) {
  const { data: categories = [] } = useAdminCategories();

  const availableTypes = selectedCategoryId
    ? (categories.find((c) => c.id === selectedCategoryId)?.objectTypes ?? [])
    : categories.flatMap((c) => c.objectTypes);

  const typeOptions = availableTypes.map((t) => ({
    value: t.id,
    label: t.nameUz,
    disabled: BOUNDARY_TYPE_NAMES.has(t.nameUz),
  }));

  const hasDistrict = selectedDistrictId !== null;

  return (
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
          options={categories.map((c) => ({ value: c.id, label: c.nameUz }))}
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
          placeholder={hasDistrict ? 'Turlarni tanlang' : 'Avval tuman tanlang'}
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
  );
}
