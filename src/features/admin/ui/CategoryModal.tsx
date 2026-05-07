import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useCreateCategory, useUpdateCategory } from '@/features/admin/api/useObjectTypeMutations';
import type { ObjectCategory } from '@/entities/object-type/model/types';

type ModalState = { mode: 'create' | 'edit'; item?: ObjectCategory } | null;

interface Props {
  modal: ModalState;
  onClose: () => void;
}

export default function CategoryModal({ modal, onClose }: Props) {
  const [form] = Form.useForm();

  const { mutate: createCat, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCat, isPending: isUpdating } = useUpdateCategory(
    modal?.item?.id ?? 0,
  );

  useEffect(() => {
    if (!modal) return;
    if (modal.mode === 'edit' && modal.item) {
      form.setFieldsValue({
        code: modal.item.code,
        nameUz: modal.item.nameUz,
        nameKrill: modal.item.nameKrill,
      });
    } else {
      form.resetFields();
    }
  }, [modal, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = (values: {
    code: string;
    nameUz: string;
    nameKrill?: string;
  }) => {
    if (modal?.mode === 'create') {
      createCat(values, { onSuccess: handleClose });
    } else {
      updateCat(values, { onSuccess: handleClose });
    }
  };

  return (
    <Modal
      open={!!modal}
      title={modal?.mode === 'create' ? 'Yangi kategoriya' : 'Kategoriyani tahrirlash'}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={isCreating || isUpdating}
      okText='Saqlash'
      cancelText='Bekor qilish'
      destroyOnHidden
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit} className='pt-3'>
        <Form.Item
          label='Kod'
          name='code'
          rules={[
            { required: true, message: 'Kod kiritilishi shart' },
            { max: 20, message: 'Kod 20 ta belgidan oshmasligi kerak' },
          ]}
          extra='Qisqa kod, masalan: APU, MHU, MTU'
        >
          <Input
            placeholder='APU'
            style={{ fontFamily: 'monospace' }}
            maxLength={20}
          />
        </Form.Item>
        <Form.Item
          label='Nomi (lotin)'
          name='nameUz'
          rules={[
            { required: true, message: 'Nom kiritilishi shart' },
            { max: 200, message: 'Nom 200 ta belgidan oshmasligi kerak' },
          ]}
        >
          <Input placeholder='Kategoriya nomi' maxLength={200} />
        </Form.Item>
        <Form.Item
          label='Nomi (kirill)'
          name='nameKrill'
          rules={[{ max: 200, message: 'Nom 200 ta belgidan oshmasligi kerak' }]}
        >
          <Input placeholder='Kirill (ixtiyoriy)' maxLength={200} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
