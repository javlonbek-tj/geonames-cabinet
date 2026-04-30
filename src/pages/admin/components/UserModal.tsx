import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch } from 'antd';
import {
  useCreateUser,
  useUpdateUser,
  useResetPassword,
} from '@/hooks/admin/useUsers';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import type { CreateUserPayload, UpdateUserPayload } from '@/api/admin.api';
import {
  DISTRICT_ROLES,
  REGIONAL_ROLES,
  COMMISSION_POSITION_LABELS,
} from '@/types/user';
import { ROLE_LABELS } from '@/constants';
import type { User, UserRole } from '@/types';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS)
  .filter(([key]) => key !== 'admin')
  .map(([value, label]) => ({ value, label }));

export type ModalMode = 'create' | 'edit' | 'password';

interface Props {
  modal: { mode: ModalMode; user?: User } | null;
  onClose: () => void;
}

export default function UserModal({ modal, onClose }: Props) {
  const [form] = Form.useForm();
  const selectedRole = Form.useWatch('role', form) as UserRole | undefined;
  const selectedRegionId = Form.useWatch('regionId', form) as
    | number
    | undefined;

  const editingId = modal?.mode !== 'create' ? modal?.user?.id : undefined;
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(
    editingId ?? 0,
  );
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword(
    editingId ?? 0,
  );

  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(selectedRegionId);

  const needsDistrict = DISTRICT_ROLES.includes(selectedRole as UserRole);
  const needsRegion =
    REGIONAL_ROLES.includes(selectedRole as UserRole) || needsDistrict;

  useEffect(() => {
    if (!modal) return;
    if (modal.mode === 'create' || modal.mode === 'password') {
      form.resetFields();
    } else if (modal.mode === 'edit' && modal.user) {
      form.setFieldsValue({
        fullName: modal.user.fullName,
        role: modal.user.role,
        regionId: modal.user.regionId,
        districtId: modal.user.districtId,
        position: modal.user.position,
        isActive: modal.user.isActive,
        isBlocked: modal.user.isBlocked,
      });
    }
  }, [modal, form]);

  const handleSubmit = (
    values: CreateUserPayload | UpdateUserPayload | { newPassword: string },
  ) => {
    if (modal?.mode === 'create') {
      createUser(values as CreateUserPayload, { onSuccess: onClose });
    } else if (modal?.mode === 'edit') {
      updateUser(values as UpdateUserPayload, { onSuccess: onClose });
    } else if (modal?.mode === 'password') {
      resetPassword((values as { newPassword: string }).newPassword, {
        onSuccess: onClose,
      });
    }
  };

  const title =
    modal?.mode === 'create'
      ? 'Yangi foydalanuvchi'
      : modal?.mode === 'edit'
        ? 'Tahrirlash'
        : 'Parolni yangilash';

  const isPending = isCreating || isUpdating || isResetting;

  return (
    <Modal
      open={!!modal}
      title={title}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isPending}
      okText='Saqlash'
      cancelText='Bekor qilish'
      destroyOnHidden
    >
      {modal?.mode === 'password' ? (
        <Form form={form} layout='vertical' onFinish={handleSubmit} className='pt-3'>
          <Form.Item
            label='Yangi parol'
            name='newPassword'
            rules={[
              { required: true, message: 'Parol kiritilishi shart' },
              { min: 8, message: 'Kamida 8 ta belgi' },
            ]}
          >
            <Input.Password placeholder='Yangi parolni kiriting' />
          </Form.Item>
        </Form>
      ) : (
        <Form form={form} layout='vertical' onFinish={handleSubmit} className='pt-3'>
          {modal?.mode === 'create' && (
            <>
              <Form.Item
                label='Username'
                name='username'
                rules={[
                  { required: true, message: 'Username kiritilishi shart' },
                  { min: 3, message: 'Kamida 3 ta belgi' },
                  { max: 50, message: '50 ta belgidan oshmasligi kerak' },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: 'Faqat harf, raqam va _ mumkin',
                  },
                ]}
              >
                <Input placeholder='username' maxLength={50} />
              </Form.Item>
              <Form.Item
                label='Parol'
                name='password'
                rules={[
                  { required: true, message: 'Parol kiritilishi shart' },
                  { min: 8, message: 'Kamida 8 ta belgi' },
                ]}
              >
                <Input.Password placeholder='Parol' />
              </Form.Item>
            </>
          )}

          <Form.Item
            label='F.I.O.'
            name='fullName'
            rules={[
              {
                required: modal?.mode === 'create',
                message: 'F.I.O. kiritilishi shart',
              },
              { min: 2, message: "F.I.O. kamida 2 ta belgi bo'lishi kerak" },
              { max: 200, message: 'F.I.O. 200 ta belgidan oshmasligi kerak' },
            ]}
          >
            <Input placeholder="To'liq ism" maxLength={200} />
          </Form.Item>

          <Form.Item
            label='Rol'
            name='role'
            rules={[{ required: true, message: 'Rol tanlanishi shart' }]}
          >
            <Select
              placeholder='Rol tanlang'
              options={ROLE_OPTIONS}
              onChange={() => {
                form.setFieldsValue({ regionId: undefined, districtId: undefined });
              }}
            />
          </Form.Item>

          {needsRegion && (
            <Form.Item
              label='Viloyat'
              name='regionId'
              rules={[{ required: true, message: 'Viloyat tanlanishi shart' }]}
            >
              <Select
                placeholder='Viloyat tanlang'
                options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
                onChange={() => {
                  form.setFieldValue('districtId', undefined);
                }}
              />
            </Form.Item>
          )}

          {needsDistrict && (
            <Form.Item
              label='Tuman'
              name='districtId'
              rules={[{ required: true, message: 'Tuman tanlanishi shart' }]}
            >
              <Select
                placeholder='Tuman tanlang'
                disabled={!selectedRegionId}
                options={districts.map((d) => ({ value: d.id, label: d.nameUz }))}
              />
            </Form.Item>
          )}

          {selectedRole === 'district_commission' && (
            <Form.Item
              label='Lavozim'
              name='position'
              rules={[{ required: true, message: 'Lavozim tanlanishi shart' }]}
            >
              <Select
                placeholder='Lavozim tanlang'
                options={Object.entries(COMMISSION_POSITION_LABELS).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            </Form.Item>
          )}

          {modal?.mode === 'edit' && (
            <div className='flex gap-4'>
              <Form.Item label='Faol' name='isActive' valuePropName='checked'>
                <Switch />
              </Form.Item>
              <Form.Item label='Bloklangan' name='isBlocked' valuePropName='checked'>
                <Switch />
              </Form.Item>
            </div>
          )}
        </Form>
      )}
    </Modal>
  );
}
