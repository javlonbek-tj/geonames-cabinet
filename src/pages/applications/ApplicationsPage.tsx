import { useState } from 'react';
import { Table, Tag, Typography, Button, Card, type TableProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useApplications } from '@/hooks/applications/useApplications';
import { useAuthStore } from '@/store/authStore';
import { STATUS_LABELS, STATUS_COLORS } from '@/constants';
import { ROLES, REGIONAL_ROLES } from '@/types/user';
import type { Application, ApplicationStatus } from '@/types';
import ApplicationFilters from './components/ApplicationFilters';

const { Title } = Typography;

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

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [applicationNumberInput, setApplicationNumberInput] = useState('');
  const [applicationNumber, setApplicationNumber] = useState<
    string | undefined
  >(undefined);
  const [regionId, setRegionId] = useState<number | undefined>(undefined);
  const [districtId, setDistrictId] = useState<number | undefined>(undefined);

  const isAdmin = user?.role === ROLES.ADMIN;
  const isRegional = REGIONAL_ROLES.includes(user?.role ?? ('' as never));

  const { data, isFetching } = useApplications({
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
        {user?.role === ROLES.DKP_FILIAL && (
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => void navigate('/geographic-objects/create')}
          >
            Yangi obyekt
          </Button>
        )}
      </div>

      <ApplicationFilters
        applicationNumberInput={applicationNumberInput}
        setApplicationNumberInput={setApplicationNumberInput}
        setApplicationNumber={setApplicationNumber}
        status={status}
        setStatus={setStatus}
        regionId={regionId}
        setRegionId={setRegionId}
        districtId={districtId}
        setDistrictId={setDistrictId}
        setPage={setPage}
        isAdmin={isAdmin}
        isRegional={isRegional}
        userRegionId={user?.regionId ?? undefined}
      />

      <Card size='small' styles={{ body: { padding: 0 } }}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={data?.data ?? []}
          loading={isFetching}
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
