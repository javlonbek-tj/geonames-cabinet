import { useState, useCallback } from 'react';
import { Card, Table, Tag, Typography, Input, Select } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useNonCompliantList } from '@/entities/geo-flag/api/useGeoFlags';
import { useRegions, useDistricts } from '@/entities/location/api/useLocations';
import { nonCompliantColumns } from './nonCompliantColumns';

const { Title } = Typography;
const DEFAULT_LIMIT = 20;

export default function NonCompliantPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [regionId, setRegionId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  const { data: districts = [] } = useDistricts(regionId ?? undefined);
  const { data: regions = [] } = useRegions();

  const { data: result, isFetching } = useNonCompliantList({
    regionId: regionId ?? undefined,
    districtId: districtId ?? undefined,
    search: search || undefined,
    page,
    limit,
  });

  const applySearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-3'>
        <WarningOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
        <Title level={4} className='m-0'>
          Nomuvofiq geografik obyektlar
        </Title>
        {result && <Tag color='orange'>{result.meta.total} ta</Tag>}
      </div>

      {/* Filters */}
      <Card size='small'>
        <div className='flex flex-wrap gap-3'>
          <Input.Search
            placeholder='Nom yoki ariza raqami...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={applySearch}
            onClear={() => {
              setSearchInput('');
              setSearch('');
              setPage(1);
            }}
            allowClear
            style={{ width: 260 }}
          />
          <Select
            placeholder='Viloyat'
            allowClear
            style={{ width: 200 }}
            value={regionId ?? undefined}
            onChange={(v) => {
              setRegionId(v ?? null);
              setDistrictId(null);
              setPage(1);
            }}
            options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
            showSearch={{
              filterOption: (input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase()),
            }}
          />
          <Select
            placeholder='Tuman'
            allowClear
            style={{ width: 200 }}
            value={districtId ?? undefined}
            disabled={!regionId}
            onChange={(v) => {
              setDistrictId(v ?? null);
              setPage(1);
            }}
            options={districts.map((d) => ({ value: d.id, label: d.nameUz }))}
            showSearch={{
              filterOption: (input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase()),
            }}
          />
        </div>
      </Card>

      <Card size='small' styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={result?.data ?? []}
          columns={nonCompliantColumns}
          rowKey='id'
          loading={isFetching}
          size='small'
          bordered
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: limit,
            total: result?.meta.total ?? 0,
            hideOnSinglePage: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => (
              <span className='inline-flex items-center gap-1 px-3 py-0.5 rounded text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'>
                Jami: {total} ta
              </span>
            ),
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
        />
      </Card>
    </div>
  );
}
