import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Table, Typography, Modal, message } from 'antd';
import {
  useRegistry,
  useDeleteRegistryObject,
} from '@/features/registry/api/useRegistry';
import type { GeographicObject } from '@/entities/geographic-object/model/types';
import { useAuthStore } from '@/entities/user/model/authStore';
import { ROLES, DISTRICT_ROLES, REGIONAL_ROLES } from '@/entities/user/model/types';
import { useRegistryFilters } from '@/features/registry/hooks/useRegistryFilters';
import { useRegistryColumns } from '@/features/registry/hooks/useRegistryColumns';
import RegistryFilters from '@/features/registry/ui/RegistryFilters';
import EditRegistryModal from '@/features/registry/ui/EditRegistryModal';
import KochirmaModal from '@/features/registry/ui/KochirmaModal';

const { Title } = Typography;
const DEFAULT_LIMIT = 10;

export default function RegistryPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERUSER;
  const isDistrictRole = DISTRICT_ROLES.includes(user?.role ?? ('' as never));
  const isRegionalRole = REGIONAL_ROLES.includes(user?.role ?? ('' as never));

  const {
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    applySearch,
    clearFilters,
    hasFilters,
  } = useRegistryFilters();

  const [editObj, setEditObj] = useState<GeographicObject | null>(null);
  const [kochirmaObj, setKochirmaObj] = useState<GeographicObject | null>(null);

  const scopedFilters = {
    ...filters,
    ...(isDistrictRole && { districtId: user?.districtId ?? undefined }),
    ...(isRegionalRole && { regionId: user?.regionId ?? undefined }),
  };

  const { data, isFetching } = useRegistry(scopedFilters);
  const { mutate: deleteObj } = useDeleteRegistryObject();

  const handleDelete = (id: number, name?: string | null) => {
    Modal.confirm({
      title: "O'chirishni tasdiqlaysizmi?",
      content: name ? `"${name}" obyekti o'chiriladi` : "Obyekt o'chiriladi",
      okText: "O'chirish",
      cancelText: 'Bekor qilish',
      okButtonProps: { danger: true },
      centered: true,
      onOk: () =>
        new Promise((resolve, reject) => {
          deleteObj(id, {
            onSuccess: () => {
              message.success("Obyekt o'chirildi");
              resolve(undefined);
            },
            onError: (err: { response?: { data?: { message?: string } } }) => {
              message.error(err.response?.data?.message ?? 'Xatolik yuz berdi');
              reject();
            },
          });
        }),
    });
  };

  const columns = useRegistryColumns({
    page: filters.page ?? 1,
    limit: filters.limit ?? DEFAULT_LIMIT,
    isAdmin,
    onView: (id) => void navigate(`/geographic-objects/${id}`),
    onEdit: setEditObj,
    onDelete: handleDelete,
    onKochirma: setKochirmaObj,
  });

  return (
    <div className='flex flex-col gap-4'>
      <Title level={4} className='m-0'>
        Geografik obyektlar reyestri
      </Title>

      <RegistryFilters
        filters={filters}
        setFilters={setFilters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        applySearch={applySearch}
        clearFilters={clearFilters}
        hasFilters={hasFilters}
        isDistrictRole={isDistrictRole}
        isRegionalRole={isRegionalRole}
      />

      <Card size='small' styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={data?.data ?? []}
          columns={columns}
          rowKey='id'
          loading={isFetching}
          pagination={{
            current: filters.page ?? 1,
            pageSize: filters.limit ?? DEFAULT_LIMIT,
            total: data?.meta.total ?? 0,
            hideOnSinglePage: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => (
              <span className='inline-flex items-center gap-1 px-3 py-0.5 rounded text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'>
                Jami: {total} ta
              </span>
            ),
            onChange: (page, pageSize) =>
              setFilters((f) => ({ ...f, page, limit: pageSize })),
          }}
          size='small'
          bordered
          className='registry-table'
          scroll={{ x: 1100 }}
        />
      </Card>

      <EditRegistryModal editObj={editObj} onClose={() => setEditObj(null)} />
      <KochirmaModal obj={kochirmaObj} onClose={() => setKochirmaObj(null)} />
    </div>
  );
}
