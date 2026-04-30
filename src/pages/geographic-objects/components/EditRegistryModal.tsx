import { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useUpdateRegistryObject } from '@/hooks/geographic-objects/useRegistry';
import { useRegions, useDistricts } from '@/hooks/locations/useLocations';
import { useAdminCategories } from '@/hooks/admin/useObjectTypes';
import type { GeographicObject } from '@/types';

interface Props {
  editObj: GeographicObject | null;
  onClose: () => void;
}

export default function EditRegistryModal({ editObj, onClose }: Props) {
  const [editForm] = Form.useForm();
  const editCategoryId = Form.useWatch('categoryId', editForm) as
    | number
    | undefined;
  const editRegionId = Form.useWatch('regionId', editForm) as
    | number
    | undefined;

  const { data: regions = [] } = useRegions();
  const { data: editDistricts = [] } = useDistricts(editRegionId);
  const { data: categories = [] } = useAdminCategories();
  const { mutate: updateObj, isPending: isUpdating } =
    useUpdateRegistryObject();

  const editTypeOptions =
    categories.find((c) => c.id === editCategoryId)?.objectTypes ?? [];

  useEffect(() => {
    if (!editObj) return;
    editForm.setFieldsValue({
      nameUz: editObj.nameUz,
      nameKrill: editObj.nameKrill,
      registryNumber: editObj.registryNumber ?? undefined,
      regionId: editObj.regionId,
      districtId: editObj.districtId,
      categoryId: editObj.objectType?.categoryId,
      objectTypeId: editObj.objectTypeId ?? undefined,
      basisDocument: editObj.basisDocument,
      affiliation: editObj.affiliation,
      historicalName: editObj.historicalName,
      comment: editObj.comment,
    });
  }, [editObj, editForm]);

  const handleSubmit = (values: Record<string, unknown>) => {
    if (!editObj) return;
    const data = {
      ...values,
      categoryId: undefined,
      registryNumber: (values.registryNumber as string)?.trim() || undefined,
    };
    updateObj(
      { id: editObj.id, data },
      {
        onSuccess: () => {
          message.success("O'zgarishlar saqlandi");
          onClose();
          editForm.resetFields();
        },
        onError: () => message.error('Xatolik yuz berdi'),
      },
    );
  };

  return (
    <Modal
      open={!!editObj}
      title='Obyektni tahrirlash'
      onCancel={() => {
        onClose();
        editForm.resetFields();
      }}
      onOk={() => editForm.submit()}
      confirmLoading={isUpdating}
      okText='Saqlash'
      cancelText='Bekor qilish'
      width={600}
      destroyOnHidden
    >
      <Form
        form={editForm}
        layout='vertical'
        onFinish={handleSubmit}
        className='pt-2'
      >
        <div className='grid grid-cols-2 gap-x-4'>
          <Form.Item
            label='Nomi (lotin)'
            name='nameUz'
            rules={[
              { required: true, message: 'Nom kiritilishi shart' },
              { max: 200, message: 'Maksimal 200 ta belgi' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Nomi (kirill)'
            name='nameKrill'
            rules={[{ max: 200, message: 'Maksimal 200 ta belgi' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Tarixiy nomi'
            name='historicalName'
            rules={[{ max: 200, message: 'Maksimal 200 ta belgi' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Reyestr raqami'
            name='registryNumber'
            rules={[
              { required: true, message: 'Reyestr raqami kiritilishi shart' },
              { max: 50, message: 'Maksimal 50 ta belgi' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Viloyat'
            name='regionId'
            rules={[{ required: true, message: 'Viloyat tanlanishi shart' }]}
          >
            <Select
              options={regions.map((r) => ({ value: r.id, label: r.nameUz }))}
              onChange={() => {
                editForm.setFieldValue('districtId', undefined);
              }}
            />
          </Form.Item>
          <Form.Item
            label='Tuman'
            name='districtId'
            rules={[{ required: true, message: 'Tuman tanlanishi shart' }]}
          >
            <Select
              options={editDistricts.map((d) => ({
                value: d.id,
                label: d.nameUz,
              }))}
            />
          </Form.Item>
          <Form.Item
            label='Guruh'
            name='categoryId'
            rules={[{ required: true, message: 'Guruh tanlanishi shart' }]}
          >
            <Select
              options={categories.map((c) => ({
                value: c.id,
                label: c.nameUz,
              }))}
              onChange={() => {
                editForm.setFieldValue('objectTypeId', undefined);
              }}
            />
          </Form.Item>
          <Form.Item
            label='Tur'
            name='objectTypeId'
            rules={[{ required: true, message: 'Tur tanlanishi shart' }]}
          >
            <Select
              disabled={!editCategoryId}
              options={editTypeOptions.map((t) => ({
                value: t.id,
                label: t.nameUz,
              }))}
            />
          </Form.Item>
        </div>
        <Form.Item
          label='Tegishlilik'
          name='affiliation'
          rules={[{ max: 200, message: 'Maksimal 200 ta belgi' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Me'yoriy hujjat" name='basisDocument'>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item label='Izoh' name='comment'>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
