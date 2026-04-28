import { useState } from 'react';
import { Card, Button, Alert, Modal, Input, Typography } from 'antd';
import { usePerformAction } from '@/hooks/applications/useApplication';
import type { AvailableAction } from '@/types';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  appId: number;
  actions: AvailableAction[];
  actionsBlocked: boolean;
  needsDocumentUpload: boolean;
  hasUnsavedEdits: boolean;
  allNamed: boolean;
}

export default function ApplicationActions({
  appId,
  actions,
  actionsBlocked,
  needsDocumentUpload,
  hasUnsavedEdits,
  allNamed,
}: Props) {
  const [modal, setModal] = useState<{ action: string; label: string } | null>(null);
  const [comment, setComment] = useState('');
  const { mutate: performAction, isPending: isActing } = usePerformAction(appId);

  const blockMessage = needsDocumentUpload
    ? "Yakunlash uchun avval Kengash qarorining PDF nusxasini yuklang"
    : hasUnsavedEdits && allNamed
      ? "Nomlarni saqlang, so'ng yuborishingiz mumkin"
      : "Barcha obyektlarga lotin va kirill nomlar berilib, saqlangunga qadar yuborish mumkin emas";

  const handleAction = () => {
    if (!modal) return;
    performAction(
      { action: modal.action, comment: comment.trim() || undefined },
      { onSuccess: () => { setModal(null); setComment(''); } },
    );
  };

  return (
    <>
      <Card title='Harakatlar' size='small'>
        {actionsBlocked && (
          <Alert type='warning' showIcon className='mb-3' message={blockMessage} />
        )}
        <div className='flex flex-col gap-2'>
          {actions.map((a) => (
            <Button
              key={a.action}
              type={a.action === 'return' ? 'default' : 'primary'}
              danger={a.action === 'return'}
              block
              disabled={actionsBlocked}
              onClick={() => setModal({ action: a.action, label: a.label })}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </Card>

      <Modal
        open={!!modal}
        title={modal?.label}
        onCancel={() => { setModal(null); setComment(''); }}
        onOk={handleAction}
        confirmLoading={isActing}
        okText='Tasdiqlash'
        cancelText='Bekor qilish'
      >
        <div className='flex flex-col gap-2 pt-2'>
          <Text type='secondary'>Izoh (ixtiyoriy)</Text>
          <TextArea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Izoh kiriting...'
          />
        </div>
      </Modal>
    </>
  );
}
