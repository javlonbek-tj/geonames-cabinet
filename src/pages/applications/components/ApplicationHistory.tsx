import { Card, Timeline, Empty, Tag, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import {
  STATUS_LABELS,
  STATUS_HOLDER,
  ACTION_LABELS,
  ACTION_COLORS,
  ROLE_LABELS,
} from '@/constants';
import type { ApplicationHistoryEntry, ApplicationStatus } from '@/types';

const { Text } = Typography;

interface Props {
  history: ApplicationHistoryEntry[];
  currentStatus: ApplicationStatus;
}

export default function ApplicationHistory({ history, currentStatus }: Props) {
  const isFinished =
    currentStatus === 'completed' || currentStatus === 'rejected';
  return (
    <Card title='Harakatlar tarixi' size='small'>
      {history.length > 0 || currentStatus ? (
        <Timeline
          items={[
            ...history.map((h) => {
              const statusLabel = h.fromStatus
                ? STATUS_LABELS[h.fromStatus]
                : STATUS_LABELS[h.toStatus];
              return {
                key: h.id,
                color:
                  h.actionType === 'approve'
                    ? 'green'
                    : h.actionType === 'return' || h.actionType === 'reject'
                      ? 'red'
                      : 'blue',
                children: (
                  <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <Text strong>{statusLabel}</Text>
                      <Tag color={ACTION_COLORS[h.actionType]} className='m-0'>
                        {ACTION_LABELS[h.actionType] ?? h.actionType}
                      </Tag>
                      <Text type='secondary' className='text-xs'>
                        {new Date(h.createdAt).toLocaleString('uz-UZ')}
                      </Text>
                    </div>
                    <Text type='secondary' className='text-xs'>
                      {h.performer?.fullName ?? h.performer?.username}
                      {h.performer?.role
                        ? ` · ${ROLE_LABELS[h.performer.role as keyof typeof ROLE_LABELS]}`
                        : ''}
                    </Text>
                    {h.comment && <Text className='text-sm'>{h.comment}</Text>}
                  </div>
                ),
              };
            }),
            ...(!isFinished
              ? [
                  {
                    key: 'current',
                    dot: (
                      <ClockCircleOutlined
                        style={{ fontSize: 14, color: '#fa8c16' }}
                      />
                    ),
                    color: 'orange' as const,
                    children: (
                      <div className='flex flex-col gap-0.5'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <Text strong style={{ color: '#fa8c16' }}>
                            {STATUS_LABELS[currentStatus]}
                          </Text>
                          <Tag color='orange' className='m-0'>
                            Kutilmoqda
                          </Tag>
                        </div>
                        {STATUS_HOLDER[currentStatus] && (
                          <Text type='secondary' className='text-xs'>
                            Hozir kimda:{' '}
                            <span className='font-medium text-gray-700'>
                              {STATUS_HOLDER[currentStatus]}
                            </span>
                          </Text>
                        )}
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      ) : (
        <Empty
          description='Harakatlar tarixi mavjud emas'
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
}
