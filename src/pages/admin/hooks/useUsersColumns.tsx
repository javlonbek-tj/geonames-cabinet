import { useMemo } from 'react';
import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { ROLE_LABELS } from '@/constants';
import type { Region, District, User } from '@/types';

const { Text } = Typography;

interface Params {
  page: number;
  regions: Region[];
  allDistricts: District[];
  currentUserId: number | undefined;
  onEdit: (user: User) => void;
  onPassword: (user: User) => void;
  onDelete: (id: number) => void;
}

export function useUsersColumns({
  page,
  regions,
  allDistricts,
  currentUserId,
  onEdit,
  onPassword,
  onDelete,
}: Params) {
  return useMemo(
    () => [
      {
        title: '#',
        width: 50,
        render: (_: unknown, __: User, i: number) => (
          <Text type='secondary'>{(page - 1) * 10 + i + 1}</Text>
        ),
      },
      {
        title: 'Foydalanuvchi',
        key: 'user',
        render: (u: User) => (
          <div>
            <div className='font-medium'>{u.fullName ?? u.username}</div>
            <Text type='secondary' className='text-xs'>
              {u.username}
            </Text>
          </div>
        ),
      },
      {
        title: 'Rol',
        key: 'role',
        render: (u: User) => <Tag>{ROLE_LABELS[u.role] ?? u.role}</Tag>,
      },
      {
        title: 'Viloyat / Tuman',
        key: 'location',
        render: (u: User) => {
          const region = regions.find((r) => r.id === u.regionId);
          const district = allDistricts.find((d) => d.id === u.districtId);
          if (!region) return <Text type='secondary'>—</Text>;
          return (
            <div className='text-xs'>
              <div>{region.nameUz}</div>
              {district && <Text type='secondary'>{district.nameUz}</Text>}
            </div>
          );
        },
      },
      {
        title: 'Holat',
        key: 'status',
        render: (u: User) => {
          if (u.isBlocked) return <Tag color='red'>Bloklangan</Tag>;
          if (u.isActive) return <Tag color='green'>Faol</Tag>;
          return <Tag color='default'>Nofaol</Tag>;
        },
      },
      {
        title: '',
        key: 'actions',
        width: 120,
        render: (u: User) => (
          <Space size={4}>
            <Tooltip title='Tahrirlash'>
              <Button
                size='small'
                icon={<EditOutlined />}
                onClick={() => onEdit(u)}
              />
            </Tooltip>
            <Tooltip title='Parolni yangilash'>
              <Button
                size='small'
                icon={<LockOutlined />}
                onClick={() => onPassword(u)}
              />
            </Tooltip>
            <Tooltip
              title={
                currentUserId === u.id
                  ? "O'zingizni o'chira olmaysiz"
                  : "O'chirish"
              }
            >
              <Popconfirm
                title="Foydalanuvchini o'chirishni tasdiqlaysizmi?"
                onConfirm={() => onDelete(u.id)}
                okText='Ha'
                cancelText="Yo'q"
                okButtonProps={{ danger: true }}
                disabled={currentUserId === u.id}
              >
                <Button
                  size='small'
                  danger
                  icon={<DeleteOutlined />}
                  disabled={currentUserId === u.id}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [page, regions, allDistricts, currentUserId, onEdit, onPassword, onDelete],
  );
}
