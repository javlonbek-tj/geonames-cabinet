import { Modal, Form, Input } from 'antd';
import { useResetPassword } from '@/hooks/admin/useUsers';
import type { User } from '@/types';

interface Props {
  user: User | null;
  onClose: () => void;
}

export default function ResetPasswordModal({ user, onClose }: Props) {
  const [form] = Form.useForm();
  const { mutate: resetPassword, isPending } = useResetPassword(user?.id ?? 0);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = ({ newPassword }: { newPassword: string }) => {
    resetPassword(newPassword, { onSuccess: handleClose });
  };

  return (
    <Modal
      open={!!user}
      title='Parolni yangilash'
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
    </Modal>
  );
}
