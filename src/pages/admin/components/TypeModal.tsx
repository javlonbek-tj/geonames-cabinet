import { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useCreateType, useUpdateType, useAdminCategories } from '@/hooks/admin/useObjectTypes';
import type { ObjectType } from '@/types';

type ModalState = {
  mode: 'create' | 'edit';
  item?: ObjectType;
  categoryId?: number;
} | null;

interface Props {
  modal: ModalState;
  onClose: () => void;
}

export default function TypeModal({ modal, onClose }: Props) {
  const [form] = Form.useForm();

  const { mutate: createType, isPending: isCreating } = useCreateType();
  const { mutate: updateType, isPending: isUpdating } = useUpdateType(
    modal?.item?.id ?? 0,
  );
  const { data: categories = [] } = useAdminCategories();

  useEffect(() => {
    if (!modal) return;
    if (modal.mode === 'edit' && modal.item) {
      form.setFieldsValue({
        nameUz: modal.item.nameUz,
        nameKrill: modal.item.nameKrill,
        categoryId: modal.item.categoryId,
      });
    } else {
      form.resetFields();
      form.setFieldValue('categoryId', modal.categoryId);
    }
  }, [modal, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = (values: {
    nameUz: string;
    nameKrill?: string;
    categoryId: number;
  }) => {
    if (modal?.mode === 'create') {
      createType(values, { onSuccess: handleClose });
    } else {
      updateType(values, { onSuccess: handleClose });
    }
  };

  return (
    <Modal
      open={!!modal}
      title={modal?.mode === 'create' ? 'Yangi tur' : 'Turni tahrirlash'}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={isCreating || isUpdating}
      okText='Saqlash'
      cancelText='Bekor qilish'
      destroyOnHidden
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit} className='pt-3'>
        <Form.Item
          label='Nomi (lotin)'
          name='nameUz'
          rules={[
            { required: true, message: 'Nom kiritilishi shart' },
            { max: 200, message: 'Nom 200 ta belgidan oshmasligi kerak' },
          ]}
        >
          <Input placeholder='Tur nomi' maxLength={200} />
        </Form.Item>
        <Form.Item
          label='Nomi (kirill)'
          name='nameKrill'
          rules={[{ max: 200, message: 'Nom 200 ta belgidan oshmasligi kerak' }]}
        >
          <Input placeholder='Kirill (ixtiyoriy)' maxLength={200} />
        </Form.Item>
        <Form.Item name='categoryId' hidden={modal?.mode === 'create'} label='Kategoriya'>
          <Select
            options={categories.map((c) => ({ value: c.id, label: c.nameUz }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
