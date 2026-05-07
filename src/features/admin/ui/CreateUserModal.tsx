import { Modal, Form, Input, Select } from 'antd';
import { useCreateUser } from '@/features/admin/api/useUserMutations';
import { useRegions, useDistricts } from '@/entities/location/api/useLocations';
import type { CreateUserPayload } from '@/entities/user/api/admin.api';
import {
  DISTRICT_ROLES,
  REGIONAL_ROLES,
  COMMISSION_POSITION_LABELS,
  ROLES,
} from '@/entities/user/model/types';
import { ROLE_LABELS } from '@/shared/constants';
import type { UserRole } from '@/shared/constants/roles';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS)
  .filter(([key]) => key !== ROLES.ADMIN)
  .map(([value, label]) => ({ value, label }));

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ open, onClose }: Props) {
  const [form] = Form.useForm();
  const selectedRole = Form.useWatch('role', form) as UserRole | undefined;
  const selectedRegionId = Form.useWatch('regionId', form) as
    | number
    | undefined;

  const { mutate: createUser, isPending } = useCreateUser();
  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(selectedRegionId);

  const needsDistrict = DISTRICT_ROLES.includes(selectedRole as UserRole);
  const needsRegion =
    REGIONAL_ROLES.includes(selectedRole as UserRole) || needsDistrict;

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = (values: CreateUserPayload) => {
    createUser(values, { onSuccess: handleClose });
  };

  return (
    <Modal
      open={open}
      title='Yangi foydalanuvchi'
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

        <Form.Item
          label='F.I.O.'
          name='fullName'
          rules={[
            { required: true, message: 'F.I.O. kiritilishi shart' },
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
      </Form>
    </Modal>
  );
}
