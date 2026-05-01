import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch } from 'antd';
import { useUpdateUser } from '@/hooks/admin/useUsers';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import type { UpdateUserPayload } from '@/api/admin.api';
import {
  DISTRICT_ROLES,
  REGIONAL_ROLES,
  COMMISSION_POSITION_LABELS,
  ROLES,
} from '@/types/user';
import { ROLE_LABELS } from '@/constants';
import type { User, UserRole } from '@/types';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS)
  .filter(([key]) => key !== ROLES.ADMIN)
  .map(([value, label]) => ({ value, label }));

interface Props {
  user: User | null;
  onClose: () => void;
}

export default function EditUserModal({ user, onClose }: Props) {
  const [form] = Form.useForm();
  const selectedRole = Form.useWatch('role', form) as UserRole | undefined;
  const selectedRegionId = Form.useWatch('regionId', form) as
    | number
    | undefined;

  const { mutate: updateUser, isPending } = useUpdateUser(user?.id ?? 0);
  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(selectedRegionId);

  const needsDistrict = DISTRICT_ROLES.includes(selectedRole as UserRole);
  const needsRegion =
    REGIONAL_ROLES.includes(selectedRole as UserRole) || needsDistrict;

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({
      fullName: user.fullName,
      role: user.role,
      regionId: user.regionId,
      districtId: user.districtId,
      position: user.position,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
    });
  }, [user, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = (values: UpdateUserPayload) => {
    updateUser(values, { onSuccess: handleClose });
  };

  return (
    <Modal
      open={!!user}
      title='Tahrirlash'
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={isPending}
      okText='Saqlash'
      cancelText='Bekor qilish'
      destroyOnHidden
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        className='pt-3'
      >
        <Form.Item
          label='F.I.O.'
          name='fullName'
          rules={[
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
              form.setFieldsValue({
                regionId: undefined,
                districtId: undefined,
              });
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

        <div className='flex gap-4'>
          <Form.Item label='Faol' name='isActive' valuePropName='checked'>
            <Switch />
          </Form.Item>
          <Form.Item
            label='Bloklangan'
            name='isBlocked'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
