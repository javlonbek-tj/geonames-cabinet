import { useState } from 'react';
import { Card, Button, Alert, Space, Tag, Typography, Modal, Input } from 'antd';
import {
  useCommissionApprovals,
  useApproveAsCommission,
  useRejectCommission,
  useRevokeCommissionApproval,
} from '@/hooks/commission/useCommission';
import { useAuthStore } from '@/store/authStore';
import { ROLES } from '@/types/user';
import { COMMISSION_POSITION_LABELS, type CommissionPosition } from '@/types/user';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  appId: number;
  isCommissionStep: boolean;
}

export default function CommissionPanel({ appId, isCommissionStep }: Props) {
  const user = useAuthStore((s) => s.user);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  const { data: commissionApprovals = [] } = useCommissionApprovals(
    isCommissionStep ? appId : 0,
  );
  const { mutate: approveAsCommission, isPending: isApproving } =
    useApproveAsCommission(appId);
  const { mutate: rejectCommission, isPending: isRejecting } =
    useRejectCommission(appId);
  const { mutate: revokeApproval, isPending: isRevoking } =
    useRevokeCommissionApproval(appId);

  if (!isCommissionStep) return null;

  const myApproval =
    user?.role === ROLES.DISTRICT_COMMISSION && user.position
      ? commissionApprovals.find((a) => a.position === user.position)
      : null;
  const approvedCount = commissionApprovals.filter((a) => a.approved).length;
  const total = Object.keys(COMMISSION_POSITION_LABELS).length;

  return (
    <>
      <Card title='Tuman komissiyasi kelishuvi' size='small'>
        {user?.role === ROLES.DISTRICT_COMMISSION && !user.position && (
          <Alert
            type='warning'
            showIcon
            className='mb-3'
            message="Sizning lavozimingiz belgilanmagan. Administrator bilan bog'laning."
          />
        )}

        {user?.role === ROLES.DISTRICT_COMMISSION && user.position && (
          <div className='mb-3 p-2 bg-gray-50 rounded flex items-center gap-2 flex-wrap'>
            <Text className='text-sm flex-1'>
              <strong>
                {COMMISSION_POSITION_LABELS[user.position as CommissionPosition]}
              </strong>
              {' — '}
              {!myApproval && <span className='text-gray-400'>Qaror kutilmoqda</span>}
              {myApproval?.approved && <span className='text-green-600'>Kelishildi ✓</span>}
              {myApproval && !myApproval.approved && <span className='text-red-500'>Rad etildi</span>}
            </Text>
            {!myApproval && (
              <Space size={6}>
                <Button type='primary' size='small' loading={isApproving} onClick={() => approveAsCommission()}>
                  Kelishdim
                </Button>
                <Button
                  danger
                  size='small'
                  onClick={() => { setRejectComment(''); setRejectModal(true); }}
                >
                  Rad etish
                </Button>
              </Space>
            )}
            {myApproval && (
              <Button size='small' loading={isRevoking} onClick={() => revokeApproval()}>
                Kelishuvni bekor qilish
              </Button>
            )}
          </div>
        )}

        <div className='flex flex-col'>
          {(Object.keys(COMMISSION_POSITION_LABELS) as CommissionPosition[]).map((pos) => {
            const approval = commissionApprovals.find((a) => a.position === pos);
            return (
              <div
                key={pos}
                className='flex items-start justify-between py-1.5 border-b border-gray-100 last:border-0 gap-2'
              >
                <Space size={6} align='start'>
                  <span
                    className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      !approval ? 'bg-gray-300' : approval.approved ? 'bg-green-500' : 'bg-red-400'
                    }`}
                  />
                  <div>
                    <Text className='text-sm'>{COMMISSION_POSITION_LABELS[pos]}</Text>
                    {approval && !approval.approved && approval.comment && (
                      <Text type='secondary' className='text-xs block italic'>
                        &ldquo;{approval.comment}&rdquo;
                      </Text>
                    )}
                  </div>
                </Space>
                {approval && (
                  <Text type='secondary' className='text-xs shrink-0'>
                    {approval.user.fullName ?? approval.user.username}
                    {' · '}
                    {new Date(approval.createdAt).toLocaleDateString('uz-UZ')}
                  </Text>
                )}
              </div>
            );
          })}
        </div>

        <div className='mt-2 pt-2 border-t border-gray-100 flex items-center justify-between'>
          <Text type='secondary' className='text-xs'>
            {approvedCount} / {total} ta kelishdi
          </Text>
          {approvedCount === total && <Tag color='green'>Barchasi kelishdi</Tag>}
        </div>
      </Card>

      <Modal
        open={rejectModal}
        title='Rad etish sababi'
        okText='Rad etish'
        okButtonProps={{ danger: true, loading: isRejecting }}
        cancelText='Bekor qilish'
        onCancel={() => setRejectModal(false)}
        onOk={() => {
          if (!rejectComment.trim()) return;
          rejectCommission(rejectComment, {
            onSuccess: () => { setRejectModal(false); setRejectComment(''); },
          });
        }}
        centered
      >
        <TextArea
          rows={3}
          placeholder='Rad etish sababini kiriting (majburiy)...'
          value={rejectComment}
          onChange={(e) => setRejectComment(e.target.value)}
          status={!rejectComment.trim() ? 'error' : undefined}
          className='mt-3'
        />
        {!rejectComment.trim() && (
          <Text type='danger' className='text-xs mt-1 block'>
            Sabab kiritilishi shart
          </Text>
        )}
      </Modal>
    </>
  );
}
