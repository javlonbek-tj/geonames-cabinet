import { useState } from 'react';
import { Table, Tag, Button, Input, Alert, Card, Modal, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useApplicationFlags, useToggleGeoFlag } from '@/hooks/geo-flags/useGeoFlags';
import type { GeographicObject } from '@/types';
import type { useNameEdits } from '../hooks/useNameEdits';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  geoObjects: GeographicObject[];
  appId: number;
  canEnterNames: boolean;
  isKadastrFlagStep: boolean;
  canViewFlags: boolean;
  activeGeoIdx: number | null;
  onActiveChange: (i: number | null) => void;
  nameEdits: ReturnType<typeof useNameEdits>;
}

export default function GeoObjectsTable({
  geoObjects,
  appId,
  canEnterNames,
  isKadastrFlagStep,
  canViewFlags,
  activeGeoIdx,
  onActiveChange,
  nameEdits,
}: Props) {
  const { getEdit, updateNameUz, updateNameKrill, handleSaveNames, isSavingNames } = nameEdits;

  const [flagModal, setFlagModal] = useState<{ geoObjectId: number } | null>(null);
  const [flagComment, setFlagComment] = useState('');

  const { data: geoFlags = [] } = useApplicationFlags(
    isKadastrFlagStep || canViewFlags ? appId : 0,
  );
  const { mutate: toggleFlag, isPending: isTogglingFlag } = useToggleGeoFlag(appId);

  const columns = [
    {
      title: '#',
      width: 40,
      render: (_: unknown, __: GeographicObject, i: number) => (
        <Text type='secondary'>{i + 1}</Text>
      ),
    },
    {
      title: 'Nomi',
      key: 'nameUz',
      render: (geo: GeographicObject) => {
        if (canEnterNames) {
          return (
            <Input
              size='small'
              value={getEdit(geo).nameUz}
              placeholder='Nomni kiriting'
              status={!getEdit(geo).nameUz.trim() ? 'error' : undefined}
              onChange={(e) => updateNameUz(geo, e.target.value)}
            />
          );
        }
        return geo.nameUz ? <Text>{geo.nameUz}</Text> : <Text type='secondary'>Nomsiz</Text>;
      },
    },
    ...(canEnterNames
      ? [
          {
            title: 'Nomi (kirill)',
            key: 'nameKrill',
            render: (geo: GeographicObject) => (
              <Input
                size='small'
                value={getEdit(geo).nameKrill}
                placeholder='Kirill (avto)'
                status={!getEdit(geo).nameKrill.trim() ? 'error' : undefined}
                onChange={(e) => updateNameKrill(geo, e.target.value)}
              />
            ),
          },
        ]
      : []),
    {
      title: 'Obyekt turi',
      key: 'objectTypeId',
      render: (geo: GeographicObject) => {
        if (canEnterNames) {
          return <Input size='small' disabled value={geo.objectType?.nameUz ?? '—'} />;
        }
        return geo.objectType?.nameUz ? <Text>{geo.objectType.nameUz}</Text> : <Text type='secondary'>—</Text>;
      },
    },
    {
      title: 'Reyestrda',
      dataIndex: 'existsInRegistry',
      key: 'existsInRegistry',
      width: 90,
      render: (v: boolean | null) =>
        v == null ? '—' : (
          <Tag color={v ? 'green' : 'orange'}>{v ? 'Mavjud' : 'Yangi'}</Tag>
        ),
    },
    ...(isKadastrFlagStep || canViewFlags
      ? [
          {
            title: 'Holat',
            key: 'nomuvofiq',
            width: 130,
            render: (geo: GeographicObject) => {
              const flag = geoFlags.find((f) => f.geoObjectId === geo.id);
              if (canViewFlags) {
                return flag ? <Tag color='red'>Nomuvofiq</Tag> : <Tag color='green'>Muvofiq</Tag>;
              }
              return (
                <Button
                  size='small'
                  danger={!!flag}
                  type={flag ? 'primary' : 'default'}
                  loading={isTogglingFlag}
                  onClick={() => {
                    if (flag) {
                      toggleFlag({ geoObjectId: geo.id });
                    } else {
                      setFlagComment('');
                      setFlagModal({ geoObjectId: geo.id });
                    }
                  }}
                >
                  {flag ? 'Nomuvofiq' : 'Muvofiq'}
                </Button>
              );
            },
          },
        ]
      : []),
  ];

  return (
    <>
      <Card
        title={`Geografik obyektlar (${geoObjects.length} ta)`}
        size='small'
        extra={
          canEnterNames && (
            <Button
              size='small'
              type='primary'
              icon={<SaveOutlined />}
              loading={isSavingNames}
              onClick={handleSaveNames}
            >
              Nomlarni saqlash
            </Button>
          )
        }
      >
        {canEnterNames && (
          <Alert
            type='info'
            showIcon
            className='mb-3'
            message='Xaritadagi joylashuvga qarab har bir obyektga nom bering'
          />
        )}
        <Table
          dataSource={geoObjects}
          columns={columns}
          pagination={false}
          size='small'
          rowKey='id'
          locale={{ emptyText: 'Obyektlar mavjud emas' }}
          scroll={{ x: 600 }}
          rowClassName={(_, i) => (i === activeGeoIdx ? 'geo-row-active' : '')}
          onRow={(_, i) => ({
            onMouseEnter: () => onActiveChange(i ?? null),
            onMouseLeave: () => onActiveChange(null),
            style: { cursor: 'default' },
          })}
        />
      </Card>

      <Modal
        open={!!flagModal}
        title='Nomuvofiq deb belgilash'
        okText='Belgilash'
        okButtonProps={{ danger: true, loading: isTogglingFlag }}
        cancelText='Bekor qilish'
        onCancel={() => setFlagModal(null)}
        onOk={() => {
          if (!flagModal) return;
          toggleFlag(
            { geoObjectId: flagModal.geoObjectId, comment: flagComment.trim() || undefined },
            { onSuccess: () => setFlagModal(null) },
          );
        }}
        centered
      >
        <TextArea
          rows={3}
          placeholder='Izoh (ixtiyoriy)...'
          value={flagComment}
          onChange={(e) => setFlagComment(e.target.value)}
          className='mt-3'
        />
      </Modal>
    </>
  );
}
