import { Card, Button, Empty, Space, Popconfirm, Upload } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { useUploadDocument, useDeleteDocument } from '@/hooks/uploads/useDocuments';
import type { Document } from '@/types';

interface Props {
  appId: number;
  documents: Document[];
  canModify: boolean;
  userId: number | undefined;
}

export default function DocumentsCard({ appId, documents, canModify, userId }: Props) {
  const { mutate: uploadDoc, isPending: isUploading } = useUploadDocument(appId);
  const { mutate: deleteDoc } = useDeleteDocument(appId);

  return (
    <Card
      title='Hujjatlar'
      size='small'
      extra={
        canModify && (
          <Upload
            showUploadList={false}
            accept='.pdf,.png,.jpg,.jpeg'
            beforeUpload={(file) => { uploadDoc({ file }); return false; }}
          >
            <Button size='small' icon={<UploadOutlined />} loading={isUploading}>
              Yuklash
            </Button>
          </Upload>
        )
      }
    >
      {documents.length > 0 ? (
        <div className='flex flex-col gap-2'>
          {documents.map((doc) => {
            const ext = doc.originalName.split('.').pop()?.toLowerCase() ?? '';
            const icon =
              ext === 'pdf' ? (
                <FilePdfOutlined className='text-red-500 shrink-0' />
              ) : ['png', 'jpg', 'jpeg'].includes(ext) ? (
                <FileImageOutlined className='text-green-600 shrink-0' />
              ) : (
                <FileOutlined className='text-blue-500 shrink-0' />
              );
            return (
              <div key={doc.id} className='flex items-center justify-between gap-2'>
                <Space size={4} className='min-w-0'>
                  {icon}
                  <a
                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '') ?? ''}${doc.filePath}`}
                    target='_blank'
                    rel='noreferrer'
                    className='text-sm truncate max-w-44'
                    title={doc.originalName}
                  >
                    {doc.originalName}
                  </a>
                </Space>
                {canModify && doc.uploader?.id === userId && (
                  <Popconfirm
                    title="O'chirilsinmi?"
                    onConfirm={() => deleteDoc(doc.id)}
                    okText='Ha'
                    cancelText="Yo'q"
                  >
                    <Button type='text' danger size='small' icon={<DeleteOutlined />} />
                  </Popconfirm>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Empty description='Hujjat yuklanmagan' image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
}
