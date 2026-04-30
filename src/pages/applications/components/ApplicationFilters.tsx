import { Select, Input } from 'antd';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import { STATUS_LABELS } from '@/constants';

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface Props {
  applicationNumberInput: string;
  setApplicationNumberInput: (v: string) => void;
  setApplicationNumber: (v: string | undefined) => void;
  status: string | undefined;
  setStatus: (v: string | undefined) => void;
  regionId: number | undefined;
  setRegionId: (v: number | undefined) => void;
  districtId: number | undefined;
  setDistrictId: (v: number | undefined) => void;
  setPage: (v: number) => void;
  isAdmin: boolean;
  isRegional: boolean;
  userRegionId: number | undefined;
}

export default function ApplicationFilters({
  applicationNumberInput,
  setApplicationNumberInput,
  setApplicationNumber,
  status,
  setStatus,
  regionId,
  setRegionId,
  districtId,
  setDistrictId,
  setPage,
  isAdmin,
  isRegional,
  userRegionId,
}: Props) {
  const { data: regions } = useRegions();
  const { data: districts } = useDistricts(
    isAdmin ? regionId : (userRegionId ?? undefined),
  );

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Input.Search
        placeholder='Ariza raqami'
        allowClear
        value={applicationNumberInput}
        onChange={(e) => setApplicationNumberInput(e.target.value)}
        onSearch={(val) => {
          setApplicationNumber(val || undefined);
          setPage(1);
        }}
        onClear={() => {
          setApplicationNumberInput('');
          setApplicationNumber(undefined);
        }}
        style={{ width: 220 }}
      />

      <Select
        allowClear
        placeholder="Holat bo'yicha"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        style={{ width: 260 }}
      />

      {isAdmin && (
        <Select
          allowClear
          placeholder='Viloyat'
          options={regions?.map((r) => ({ value: r.id, label: r.nameUz }))}
          value={regionId}
          onChange={(val) => {
            setRegionId(val);
            setDistrictId(undefined);
            setPage(1);
          }}
          style={{ width: 200 }}
        />
      )}

      {(isAdmin || isRegional) && (
        <Select
          allowClear
          placeholder='Tuman'
          options={districts?.map((d) => ({ value: d.id, label: d.nameUz }))}
          value={districtId}
          onChange={(val) => {
            setDistrictId(val);
            setPage(1);
          }}
          disabled={isAdmin && !regionId}
          style={{ width: 200 }}
        />
      )}
    </div>
  );
}
