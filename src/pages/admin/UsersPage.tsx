import { useState, useCallback } from 'react';
import { Table, Button, Typography, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useUsers, useDeleteUser } from '@/hooks/admin/useUsers';
import { useRegions, useAllDistricts } from '@/hooks/locations/useLocations';
import type { User } from '@/types';
import { useAuthStore } from '@/store/authStore';
import UserModal, { type ModalMode } from './components/UserModal';
import UsersFilters from './components/UsersFilters';
import { useUsersColumns } from './hooks/useUsersColumns';

const { Title } = Typography;

export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [modal, setModal] = useState<{ mode: ModalMode; user?: User } | null>(
    null,
  );

  const { data, isFetching } = useUsers({
    page,
    limit,
    role: roleFilter,
    search: search || undefined,
  });
  const { mutate: deleteUser } = useDeleteUser();

  const { data: regions = [] } = useRegions();
  const { data: allDistricts = [] } = useAllDistricts();

  const openCreate = useCallback(() => setModal({ mode: 'create' }), []);
  const openEdit = useCallback(
    (user: User) => setModal({ mode: 'edit', user }),
    [],
  );
  const openPassword = useCallback(
    (user: User) => setModal({ mode: 'password', user }),
    [],
  );
  const closeModal = useCallback(() => setModal(null), []);

  const columns = useUsersColumns({
    page,
    regions,
    allDistricts,
    currentUserId: currentUser?.id,
    onEdit: openEdit,
    onPassword: openPassword,
    onDelete: deleteUser,
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <Title level={4} className='m-0'>
          Foydalanuvchilar
        </Title>
        <Button type='primary' icon={<PlusOutlined />} onClick={openCreate}>
          Yangi foydalanuvchi
        </Button>
      </div>

      <UsersFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        setPage={setPage}
      />

      <Card size='small' styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={data?.data ?? []}
          columns={columns}
          rowKey='id'
          loading={isFetching}
          size='small'
          bordered
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
            onChange: (p, ps) => {
              setPage(p);
              setLimit(ps);
            },
          }}
        />
      </Card>

      <UserModal modal={modal} onClose={closeModal} />
    </div>
  );
}
