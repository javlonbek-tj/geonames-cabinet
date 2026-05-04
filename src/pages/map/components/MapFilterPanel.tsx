import MapLocationFilter from './MapLocationFilter';
import MapTypeFilter from './MapTypeFilter';
import MapStatPanel from './MapStatPanel';

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
  return (
    <div className='flex flex-col gap-4 h-full'>
      <div>
        <h2 className='text-sm font-bold text-[#0f1f3d] dark:text-gray-200 mb-3 uppercase tracking-wider'>
          Xarita filtri
        </h2>
        <MapLocationFilter
          selectedRegionId={selectedRegionId}
          selectedDistrictId={selectedDistrictId}
          onRegionChange={onRegionChange}
          onDistrictChange={onDistrictChange}
        />
      </div>

      <MapTypeFilter
        selectedDistrictId={selectedDistrictId}
        selectedCategoryId={selectedCategoryId}
        selectedTypeIds={selectedTypeIds}
        onCategoryChange={onCategoryChange}
        onTypeIdsChange={onTypeIdsChange}
      />

      <MapStatPanel featureCounts={featureCounts} isLoading={isLoading} />
    </div>
  );
}
