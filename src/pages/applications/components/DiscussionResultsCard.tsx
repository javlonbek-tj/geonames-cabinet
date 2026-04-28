import { Card, Tag, Alert, Typography } from 'antd';

const { Text } = Typography;

interface DiscussionResults {
  endsAt: string;
  total: number;
  supportCount: number;
  opposeCount: number;
}

interface Props {
  results: DiscussionResults;
  isDiscussionStep: boolean;
}

export default function DiscussionResultsCard({ results, isDiscussionStep }: Props) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(results.endsAt).getTime() - Date.now()) / 86400000),
  );
  return (
    <Card title='Ommaviy muhokama natijalari' size='small'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between text-sm'>
          <Text type='secondary'>Muhokama tugash sanasi</Text>
          <Text>{new Date(results.endsAt).toLocaleDateString('uz-UZ')}</Text>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <Text type='secondary'>Jami ovozlar</Text>
          <Text strong>{results.total}</Text>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <Tag color='green'>Qo&apos;llayman: {results.supportCount}</Tag>
          <Tag color='red'>Qo&apos;llamayman: {results.opposeCount}</Tag>
        </div>
        {isDiscussionStep && (
          <Alert
            type='info'
            showIcon
            className='mt-1'
            message={`Muhokama davom etmoqda. ${daysLeft} kun qoldi.`}
          />
        )}
      </div>
    </Card>
  );
}
