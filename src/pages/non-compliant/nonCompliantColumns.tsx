import { Typography } from 'antd';
import type { TableProps } from 'antd';
import type { NonCompliantItem } from '@/api/geo-flags.api';

const { Text } = Typography;

export const nonCompliantColumns: TableProps<NonCompliantItem>['columns'] = [
  {
    title: 'Ariza raqami',
    dataIndex: 'applicationNumber',
    key: 'applicationNumber',
    width: 160,
  },
  {
    title: 'Taklif etilgan nom',
    dataIndex: 'nameUz',
    key: 'nameUz',
    render: (v: string) => v || <Text type='secondary'>Nomsiz</Text>,
  },
  {
    title: 'Obyekt turi',
    dataIndex: 'objectType',
    key: 'objectType',
    width: 160,
  },
  {
    title: 'Viloyat',
    dataIndex: 'regionName',
    key: 'regionName',
    width: 160,
    render: (v: string | null) => v ?? <Text type='secondary'>—</Text>,
  },
  {
    title: 'Tuman',
    dataIndex: 'districtName',
    key: 'districtName',
    width: 160,
    render: (v: string | null) => v ?? <Text type='secondary'>—</Text>,
  },
  {
    title: 'Izoh',
    dataIndex: 'comment',
    key: 'comment',
    render: (v: string | null) =>
      v ? (
        <Text type='secondary' className='italic text-xs'>
          "{v}"
        </Text>
      ) : (
        <Text type='secondary'>—</Text>
      ),
  },
  {
    title: 'Belgilagan',
    dataIndex: 'markedBy',
    key: 'markedBy',
    width: 160,
  },
  {
    title: 'Sana',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 110,
    render: (v: string) => new Date(v).toLocaleDateString('uz-UZ'),
  },
];
