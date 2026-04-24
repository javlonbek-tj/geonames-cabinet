import { Modal, Form, Input, Button } from 'antd';
import { useChangePassword } from '@/hooks/auth/useChangePassword';
import type { ChangePasswordSchema } from '@/lib/schemas/auth.schema';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [form] = Form.useForm<ChangePasswordSchema>();
  const { mutate, isPending } = useChangePassword(() => {
    form.resetFields();
    onClose();
  });

  const handleFinish = (values: ChangePasswordSchema) => mutate(values);

  return (
    <Modal
      title="Parolni o'zgartirish"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      width={400}
    >
      <Form form={form} layout='vertical' onFinish={handleFinish} className='mt-4'>
        <Form.Item
          name='oldPassword'
          label='Eski parol'
          rules={[{ required: true, message: 'Eski parol kiritilishi shart' }]}
        >
          <Input.Password placeholder='Eski parolni kiriting' />
        </Form.Item>

        <Form.Item
          name='newPassword'
          label='Yangi parol'
          rules={[
            { required: true, message: 'Yangi parol kiritilishi shart' },
            { min: 8, message: "Kamida 8 ta belgi bo'lishi kerak" },
          ]}
        >
          <Input.Password placeholder='Yangi parolni kiriting' />
        </Form.Item>

        <Form.Item className='mb-0'>
          <Button type='primary' htmlType='submit' loading={isPending} block>
            Saqlash
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
