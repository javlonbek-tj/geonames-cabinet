import { Card, Descriptions } from 'antd';
import type { Application, GeographicObject } from '@/types';

interface Props {
  app: Application;
  geoObjects: GeographicObject[];
}

export default function ApplicationInfoCard({ app, geoObjects }: Props) {
  const firstGeo = geoObjects[0];
  return (
    <Card title="Ariza ma'lumotlari" size='small'>
      <Descriptions column={2} size='small'>
        <Descriptions.Item label='Ariza raqami'>{app.applicationNumber}</Descriptions.Item>
        <Descriptions.Item label='Kategoriya'>{firstGeo?.objectType?.category?.nameUz ?? '—'}</Descriptions.Item>
        <Descriptions.Item label='Yaratuvchi'>{app.creator?.fullName ?? app.creator?.username ?? '—'}</Descriptions.Item>
        <Descriptions.Item label='Obyekt turi'>{firstGeo?.objectType?.nameUz ?? '—'}</Descriptions.Item>
        <Descriptions.Item label='Viloyat'>{firstGeo?.region?.nameUz ?? '—'}</Descriptions.Item>
        <Descriptions.Item label='Obyektlar soni'>{geoObjects.length} ta</Descriptions.Item>
        <Descriptions.Item label='Tuman'>{firstGeo?.district?.nameUz ?? '—'}</Descriptions.Item>
        <Descriptions.Item label='Yaratilgan'>{new Date(app.createdAt).toLocaleDateString('uz-UZ')}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
