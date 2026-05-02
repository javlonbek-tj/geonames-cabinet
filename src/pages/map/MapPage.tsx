import { useState, useMemo } from 'react';
import { Spin } from 'antd';
import {
  useMapRegions,
  useMapDistricts,
  useMapRegistryObjects,
} from '@/hooks/map/useMapData';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import { useAdminCategories } from '@/hooks/admin/useObjectTypes';
import type { MapFeature } from '@/api/map.api';
import MapView from './components/MapView';
import MapFilterPanel from './components/MapFilterPanel';
import MapBreadcrumb from './components/MapBreadcrumb';

const DEFAULT_TYPE_NAMES = new Set([
  "Ko'cha",
  "Tor ko'cha",
  "Berk ko'cha",
  "Shoh ko'cha",
]);

export default function MapPage() {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  // null = foydalanuvchi hali tanlamagan, default turlarni ishlatadi
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[] | null>(null);

  const { data: categories = [] } = useAdminCategories();

  // Default turlar (ko'chalar): categories yuklanishi bilan hisoblanadi
  const defaultTypeIds = useMemo(
    () =>
      categories
        .flatMap((c) => c.objectTypes)
        .filter((t) => DEFAULT_TYPE_NAMES.has(t.nameUz))
        .map((t) => t.id),
    [categories],
  );

  // Tuman tanlanganda null → defaultTypeIds, aks holda foydalanuvchi tanlovi
  const activeTypeIds = selectedDistrictId
    ? (selectedTypeIds ?? defaultTypeIds)
    : [];

  const { data: regionFeatures, isLoading: regionsLoading } = useMapRegions();
  const { data: districtFeatures, isFetching: districtsFetching } =
    useMapDistricts(selectedRegionId);
  const { data: registryObjects, isFetching: registryFetching } =
    useMapRegistryObjects({
      typeIds: activeTypeIds,
      regionId: selectedRegionId,
      districtId: selectedDistrictId,
    });

  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(selectedRegionId ?? undefined);

  const isLoading = regionsLoading || districtsFetching || registryFetching;

  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);

  const resetFilter = () => {
    setSelectedCategoryId(null);
    setSelectedTypeIds(null);
  };

  const handleRegionClick = (feature: MapFeature) => {
    const regionDbId =
      feature.properties.regionDbId ?? feature.properties.regionId;
    setSelectedRegionId(regionDbId);
    setSelectedDistrictId(null);
    resetFilter();
  };

  const handleDistrictClick = (feature: MapFeature) => {
    const districtDbId =
      feature.properties.districtDbId ?? feature.properties.districtId;
    setSelectedDistrictId(districtDbId);
  };

  const featureCounts = {
    regions:
      selectedRegionId === null ? (regionFeatures?.features.length ?? 0) : 0,
    districts:
      selectedRegionId !== null && selectedDistrictId === null
        ? (districtFeatures?.features.length ?? 0)
        : 0,
    mfy:
      registryObjects?.features.filter((f) => f.properties.isMfy).length ?? 0,
    streets:
      registryObjects?.features.filter((f) => f.properties.isStreet).length ??
      0,
    registry:
      registryObjects?.features.filter(
        (f) => !f.properties.isMfy && !f.properties.isStreet,
      ).length ?? 0,
  };

  const breadcrumbs = [
    {
      label: "O'zbekiston",
      onClick:
        selectedRegionId !== null
          ? () => {
              setSelectedRegionId(null);
              setSelectedDistrictId(null);
              resetFilter();
            }
          : undefined,
    },
    ...(selectedRegion
      ? [
          {
            label: selectedRegion.nameUz,
            onClick:
              selectedDistrictId !== null
                ? () => {
                    setSelectedDistrictId(null);
                    resetFilter();
                  }
                : undefined,
          },
        ]
      : []),
    ...(selectedDistrict ? [{ label: selectedDistrict.nameUz }] : []),
  ];

  return (
    <div className='-m-6 flex' style={{ height: 'calc(100vh - 112px)' }}>
      {/* Sidebar */}
      <div className='w-72 shrink-0 bg-white dark:bg-[#141414] border-r border-gray-100 dark:border-[#303030] p-4 overflow-y-auto flex flex-col'>
        <MapFilterPanel
          selectedRegionId={selectedRegionId}
          selectedDistrictId={selectedDistrictId}
          onRegionChange={(id) => {
            setSelectedRegionId(id);
            setSelectedDistrictId(null);
            resetFilter();
          }}
          onDistrictChange={(id) => {
            setSelectedDistrictId(id);
            if (id === null) resetFilter();
          }}
          selectedCategoryId={selectedCategoryId}
          selectedTypeIds={activeTypeIds}
          onCategoryChange={setSelectedCategoryId}
          onTypeIdsChange={setSelectedTypeIds}
          featureCounts={featureCounts}
          isLoading={isLoading}
        />
      </div>

      {/* Map area */}
      <div className='flex-1 relative min-w-0'>
        <div className='absolute top-3 left-3 z-1000'>
          <MapBreadcrumb crumbs={breadcrumbs} />
        </div>

        {isLoading && (
          <div className='absolute inset-0 z-1000 flex items-center justify-center pointer-events-none'>
            <Spin size='large' />
          </div>
        )}

        <MapView
          regionFeatures={regionFeatures}
          districtFeatures={districtFeatures}
          registryObjects={registryObjects}
          onRegionClick={handleRegionClick}
          onDistrictClick={handleDistrictClick}
          selectedRegionId={selectedRegionId}
          selectedDistrictId={selectedDistrictId}
        />
      </div>
    </div>
  );
}
