import { useMemo } from 'react';
import { Button, Popconfirm, Space, Tag, Typography } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ObjectCategory, ObjectType } from '@/entities/object-type/model/types';

const { Text } = Typography;

interface Params {
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onEditCat: (c: ObjectCategory) => void;
  onDeleteCat: (id: number) => void;
  onEditType: (t: ObjectType) => void;
  onDeleteType: (id: number) => void;
}

export function useObjectTypeColumns({
  selectedCategoryId,
  onSelectCategory,
  onEditCat,
  onDeleteCat,
  onEditType,
  onDeleteType,
}: Params) {
  const catColumns = useMemo(
    () => [
      {
        title: 'Kategoriya nomi',
        key: 'nameUz',
        render: (c: ObjectCategory) => (
          <button
            className={`text-left w-full px-2 py-1 cursor-pointer rounded transition-colors ${
              selectedCategoryId === c.id
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium'
                : 'hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
            onClick={() =>
              onSelectCategory(c.id === selectedCategoryId ? null : c.id)
            }
          >
            <span className='flex items-center gap-2'>
              {c.code && (
                <Tag color='blue' className='m-0 font-mono text-xs'>
                  {c.code}
                </Tag>
              )}
              {c.nameUz}
            </span>
            {c.nameKrill && (
              <Text type='secondary' className='text-xs'>
                {c.nameKrill}
              </Text>
            )}
          </button>
        ),
      },
      {
        title: 'Turlar',
        key: 'count',
        width: 70,
        render: (c: ObjectCategory) => (
          <Tag>{c.objectTypes?.length ?? 0} ta</Tag>
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 80,
        render: (c: ObjectCategory) => (
          <Space size={4}>
            <Button
              size='small'
              icon={<EditOutlined />}
              onClick={() => onEditCat(c)}
            />
            <Popconfirm
              title="Kategoriyani o'chirishni tasdiqlaysizmi?"
              description="Barcha turlar ham o'chadi"
              onConfirm={() => onDeleteCat(c.id)}
              okText='Ha'
              cancelText="Yo'q"
              okButtonProps={{ danger: true }}
            >
              <Button size='small' danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [selectedCategoryId, onSelectCategory, onEditCat, onDeleteCat],
  );

  const typeColumns = useMemo(
    () => [
      {
        title: 'Tur nomi',
        key: 'nameUz',
        render: (t: ObjectType) => (
          <div>
            <div>{t.nameUz}</div>
            {t.nameKrill && (
              <Text type='secondary' className='text-xs'>
                {t.nameKrill}
              </Text>
            )}
          </div>
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 80,
        render: (t: ObjectType) => (
          <Space size={4}>
            <Button
              size='small'
              icon={<EditOutlined />}
              onClick={() => onEditType(t)}
            />
            <Popconfirm
              title="Turni o'chirishni tasdiqlaysizmi?"
              onConfirm={() => onDeleteType(t.id)}
              okText='Ha'
              cancelText="Yo'q"
              okButtonProps={{ danger: true }}
            >
              <Button size='small' danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [onEditType, onDeleteType],
  );

  return { catColumns, typeColumns };
}
