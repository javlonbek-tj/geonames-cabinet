import api from '@/shared/api/axios';
import type { CommissionPosition } from '@/entities/user/model/types';

export interface CommissionApproval {
  id: number;
  applicationId: number;
  userId: number;
  position: CommissionPosition;
  approved: boolean;
  comment: string | null;
  createdAt: string;
  user: { id: number; fullName: string | null; username: string };
}

export const commissionApi = {
  getApprovals: (applicationId: number) =>
    api.get<{ data: CommissionApproval[] }>(`/commission/${applicationId}`),
  approve: (applicationId: number) =>
    api.post<{ data: { approvedCount: number; total: number } }>(
      `/commission/${applicationId}/approve`,
    ),
  reject: (applicationId: number, comment: string) =>
    api.post(`/commission/${applicationId}/reject`, { comment }),
  revoke: (applicationId: number) => api.delete(`/commission/${applicationId}`),
};
