import { useState } from 'react';
import {
  Table,
  Tag,
  Select,
  Input,
  Typography,
  Button,
  Card,
  type TableProps,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useApplications } from '@/hooks/applications/useApplications';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import { useAuthStore } from '@/store/authStore';
import { STATUS_LABELS, STATUS_COLORS } from '@/constants';
import type { Application, ApplicationStatus } from '@/types';

const { Title } = Typography;

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const columns: TableProps<Application>['columns'] = [
  {
    title: 'Ariza raqami',
    dataIndex: 'applicationNumber',
    key: 'applicationNumber',
    width: 180,
  },
  {
    title: 'Geografik obyektlar',
    key: 'objects',
    render: (_, record) => {
      const objs = record.geographicObjects ?? [];
      if (objs.length === 0) return '—';
      const firstName = objs[0].nameUz ?? 'Nomsiz';
      if (objs.length === 1) return firstName;
      return `${firstName} (+${objs.length - 1} ta)`;
    },
  },
  {
    title: 'Turi',
    key: 'objectType',
    render: (_, record) =>
      record.geographicObjects?.[0]?.objectType?.nameUz ?? '—',
  },
  {
    title: 'Viloyat',
    key: 'region',
    render: (_, record) => record.geographicObjects?.[0]?.region?.nameUz ?? '—',
  },
  {
    title: 'Tuman',
    key: 'district',
    render: (_, record) =>
      record.geographicObjects?.[0]?.district?.nameUz ?? '—',
  },
  {
    title: 'Holat',
    dataIndex: 'currentStatus',
    key: 'currentStatus',
    width: 260,
    render: (status: ApplicationStatus) => (
      <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
    ),
  },
  {
    title: 'Yangilangan',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 130,
    render: (val: string) => new Date(val).toLocaleDateString('uz-UZ'),
  },
];

const REGIONAL_ROLES = [
  'dkp_regional',
  'regional_commission',
  'regional_hokimlik',
];

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [applicationNumberInput, setApplicationNumberInput] = useState('');
  const [applicationNumber, setApplicationNumber] = useState<string | undefined>(undefined);
  const [regionId, setRegionId] = useState<number | undefined>(undefined);
  const [districtId, setDistrictId] = useState<number | undefined>(undefined);

  const isAdmin = user?.role === 'admin';
  const isRegional = REGIONAL_ROLES.includes(user?.role ?? '');

  // Admin sees region select; regional roles see district select within their region
  const { data: regions } = useRegions();
  const { data: districts } = useDistricts(
    isAdmin ? regionId : (user?.regionId ?? undefined),
  );

  const { data, isLoading } = useApplications({
    page,
    limit,
    status,
    applicationNumber: applicationNumber || undefined,
    regionId: isAdmin ? regionId : undefined,
    districtId: isAdmin || isRegional ? districtId : undefined,
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <Title level={4} className='m-0'>
          Arizalar
        </Title>
        {user?.role === 'dkp_filial' && (
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => void navigate('/geographic-objects/create')}
          >
            Yangi obyekt
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-2'>
        <Input.Search
          placeholder='Ariza raqami'
          allowClear
          value={applicationNumberInput}
          onChange={(e) => setApplicationNumberInput(e.target.value)}
          onSearch={(val) => { setApplicationNumber(val || undefined); setPage(1); }}
          onClear={() => { setApplicationNumberInput(''); setApplicationNumber(undefined); }}
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

      <Card size='small' styles={{ body: { padding: 0 } }}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={data?.data}
          loading={isLoading}
          size='small'
          bordered
          onRow={(record) => ({
            onClick: () => void navigate(`/applications/${record.id}`),
            className: 'cursor-pointer',
          })}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta.total ?? 0,
            hideOnSinglePage: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => (
              <span className='inline-flex items-center gap-1 px-3 py-0.5 rounded text-sm font-medium text-blue-600 bg-blue-50'>
                Jami: {total} ta
              </span>
            ),
            onChange: (p, ps) => { setPage(p); setLimit(ps); },
          }}
        />
      </Card>
    </div>
  );
}
