import { Spin } from 'antd';
import {
  EnvironmentOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

interface Props {
  featureCounts: {
    regions: number;
    districts: number;
    mfy: number;
    streets: number;
    registry: number;
  };
  isLoading: boolean;
}

export default function MapStatPanel({ featureCounts, isLoading }: Props) {
  return (
    <div className='mt-2 flex flex-col gap-2'>
      <p className='text-xs text-gray-400 font-medium uppercase tracking-wider mb-1'>
        Xaritadagi obyektlar
      </p>
      {isLoading ? (
        <div className='flex justify-center py-2'>
          <Spin size='small' />
        </div>
      ) : (
        <>
          <StatRow
            icon={<EnvironmentOutlined />}
            color='#1565c0'
            label='Viloyatlar'
            count={featureCounts.regions}
          />
          <StatRow
            icon={<ApartmentOutlined />}
            color='#15803d'
            label='Tumanlar'
            count={featureCounts.districts}
          />
          <StatRow
            icon={<AppstoreOutlined />}
            color='#06b6d4'
            label='Mahallalar'
            count={featureCounts.mfy}
          />
          <StatRow
            icon={<AppstoreOutlined />}
            color='#ca8a04'
            label="Ko'chalar"
            count={featureCounts.streets}
          />
          <StatRow
            icon={<AppstoreOutlined />}
            color='#16a34a'
            label="Qo'shimcha"
            count={featureCounts.registry}
          />
        </>
      )}
    </div>
  );
}

function StatRow({
  icon,
  color,
  label,
  count,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  count: number;
}) {
  if (count === 0) return null;
  return (
    <div className='flex items-center justify-between'>
      <span className='flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400'>
        <span style={{ color }}>{icon}</span>
        {label}
      </span>
      <span
        className='text-xs font-bold px-2 py-0.5 rounded-full'
        style={{ background: color + '18', color }}
      >
        {count}
      </span>
    </div>
  );
}
