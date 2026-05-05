import type { User } from '@/entities/user/model/types';

export interface Document {
  id: number;
  applicationId: number;
  documentType: string;
  originalName: string;
  filePath: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedBy: number;
  uploader?: Pick<User, 'id' | 'username' | 'fullName'>;
  createdAt: string;
}
