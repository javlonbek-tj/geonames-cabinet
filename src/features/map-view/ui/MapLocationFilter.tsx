import { Select } from 'antd';
import { useRegions, useDistricts } from '@/entities/location/api/useLocations';

interface Props {
  selectedRegionId: number | null;
  selectedDistrictId: number | null;
  onRegionChange: (id: number | null) => void;
  onDistrictChange: (id: number | null) => void;
}

export default function MapLocationFilter({
  selectedRegionId,
  selectedDistrictId,
  onRegionChange,
  onDistrictChange,
}: Props) {
  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(selectedRegionId ?? undefined);

  return (
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
  );
}
