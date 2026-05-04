import { Button, Space, Tooltip, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { GeographicObject } from '@/types';
import CopyableNumber from '../components/CopyableNumber';

const { Text } = Typography;
const DEFAULT_LIMIT = 10;

interface Params {
  page: number;
  limit: number;
  isAdmin: boolean;
  onView: (id: number) => void;
  onEdit: (obj: GeographicObject) => void;
  onDelete: (id: number, name?: string | null) => void;
  onKochirma: (obj: GeographicObject) => void;
}

export function useRegistryColumns({
  page,
  limit,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onKochirma,
}: Params): TableProps<GeographicObject>['columns'] {
  return [
    {
      title: '№',
      key: 'index',
      width: 52,
      render: (_: unknown, __: GeographicObject, index: number) =>
        (page - 1) * (limit ?? DEFAULT_LIMIT) + index + 1,
    },
    {
      title: 'Nomi',
      key: 'nameUz',
      width: 200,
      render: (obj: GeographicObject) => (
        <Text className='font-medium'>
          {obj.nameUz || <Text type='secondary'>—</Text>}
        </Text>
      ),
    },
    {
      title: 'Geografik obyekt guruhi',
      key: 'category',
      width: 180,
      render: (obj: GeographicObject) => {
        const cat = obj.objectType?.category;
        if (!cat) return <Text type='secondary'>—</Text>;
        return <Text className='text-sm'>{cat.nameUz}</Text>;
      },
    },
    {
      title: 'Geografik obyekt turi',
      key: 'objectType',
      width: 160,
      render: (obj: GeographicObject) =>
        obj.objectType ? (
          <Text className='text-sm'>{obj.objectType.nameUz}</Text>
        ) : (
          <Text type='secondary'>—</Text>
        ),
    },
    {
      title: 'Hudud',
      key: 'location',
      width: 160,
      render: (obj: GeographicObject) => (
        <div className='leading-tight'>
          <div className='text-sm'>{obj.region?.nameUz ?? '—'}</div>
          <Text type='secondary' className='text-xs'>
            {obj.district?.nameUz}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tegishlilik',
      key: 'affiliation',
      width: 150,
      render: (obj: GeographicObject) =>
        obj.affiliation ? (
          <Tooltip title={obj.affiliation}>
            <Text className='text-sm line-clamp-2'>{obj.affiliation}</Text>
          </Tooltip>
        ) : (
          <Text type='secondary'>—</Text>
        ),
    },
    {
      title: "Me'yoriy hujjat",
      key: 'basisDocument',
      render: (obj: GeographicObject) =>
        obj.basisDocument ? (
          <Tooltip title={obj.basisDocument}>
            <Text className='text-sm line-clamp-2'>{obj.basisDocument}</Text>
          </Tooltip>
        ) : (
          <Text type='secondary'>—</Text>
        ),
    },
    {
      title: 'Reyestr raqami',
      key: 'registryNumber',
      width: 160,
      render: (obj: GeographicObject) =>
        obj.registryNumber ? (
          <CopyableNumber value={obj.registryNumber} />
        ) : (
          <Text type='secondary'>—</Text>
        ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (obj: GeographicObject) => (
        <Space size={4}>
          <Tooltip title="Ko'rish">
            <Button
              size='small'
              icon={<EyeOutlined />}
              onClick={() => onView(obj.id)}
            />
          </Tooltip>
          <Tooltip title="Ko'chirma">
            <Button
              size='small'
              icon={<FileTextOutlined />}
              onClick={() => onKochirma(obj)}
            />
          </Tooltip>
          {isAdmin && (
            <>
              <Tooltip title='Tahrirlash'>
                <Button
                  size='small'
                  icon={<EditOutlined />}
                  onClick={() => onEdit(obj)}
                />
              </Tooltip>
              <Tooltip title="O'chirish">
                <Button
                  size='small'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(obj.id, obj.nameUz)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];
}
