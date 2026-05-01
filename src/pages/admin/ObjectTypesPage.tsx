import { useState, useCallback } from 'react';
import { Card, Table, Button, Typography, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  useAdminCategories,
  useDeleteCategory,
  useDeleteType,
} from '@/hooks/admin/useObjectTypes';
import type { ObjectCategory, ObjectType } from '@/types';
import CategoryModal from './components/CategoryModal';
import TypeModal from './components/TypeModal';
import { useObjectTypeColumns } from './hooks/useObjectTypeColumns';

const { Title } = Typography;

type CategoryModalState = {
  mode: 'create' | 'edit';
  item?: ObjectCategory;
} | null;
type TypeModalState = {
  mode: 'create' | 'edit';
  item?: ObjectType;
  categoryId?: number;
} | null;

export default function ObjectTypesPage() {
  const { data: categories = [], isLoading } = useAdminCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [catModal, setCatModal] = useState<CategoryModalState>(null);
  const [typeModal, setTypeModal] = useState<TypeModalState>(null);

  const { mutate: deleteCat } = useDeleteCategory();
  const { mutate: deleteType } = useDeleteType();

  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) ?? null;
  const types: ObjectType[] = selectedCategory?.objectTypes ?? [];

  const handleSelectCategory = useCallback(
    (id: number | null) => setSelectedCategoryId(id),
    [],
  );
  const handleEditCat = useCallback(
    (category: ObjectCategory) => setCatModal({ mode: 'edit', item: category }),
    [],
  );
  const handleEditType = useCallback(
    (type: ObjectType) => setTypeModal({ mode: 'edit', item: type }),
    [],
  );

  const { catColumns, typeColumns } = useObjectTypeColumns({
    selectedCategoryId,
    onSelectCategory: handleSelectCategory,
    onEditCat: handleEditCat,
    onDeleteCat: deleteCat,
    onEditType: handleEditType,
    onDeleteType: deleteType,
  });

  return (
    <div className='flex flex-col gap-4'>
      <Title level={4} className='m-0'>
        Geografik obyekt guruhlari
      </Title>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <Card
          title='Kategoriyalar'
          size='small'
          extra={
            <Button
              size='small'
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => setCatModal({ mode: 'create' })}
            >
              Yangi
            </Button>
          }
        >
          <Table
            dataSource={categories}
            columns={catColumns}
            rowKey='id'
            loading={isLoading}
            pagination={false}
            size='small'
            scroll={{ y: 480 }}
            locale={{ emptyText: 'Kategoriyalar mavjud emas' }}
          />
        </Card>

        <Card
          title={
            selectedCategory ? `"${selectedCategory.nameUz}" turlari` : 'Turlar'
          }
          size='small'
          extra={
            selectedCategoryId && (
              <Button
                size='small'
                type='primary'
                icon={<PlusOutlined />}
                onClick={() =>
                  setTypeModal({
                    mode: 'create',
                    categoryId: selectedCategoryId,
                  })
                }
              >
                Yangi
              </Button>
            )
          }
        >
          {!selectedCategoryId ? (
            <Empty
              description='Kategoriya tanlang'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              dataSource={types}
              columns={typeColumns}
              rowKey='id'
              pagination={false}
              scroll={{ y: 480 }}
              size='small'
              locale={{ emptyText: 'Turlar mavjud emas' }}
            />
          )}
        </Card>
      </div>

      <CategoryModal modal={catModal} onClose={() => setCatModal(null)} />
      <TypeModal modal={typeModal} onClose={() => setTypeModal(null)} />
    </div>
  );
}
