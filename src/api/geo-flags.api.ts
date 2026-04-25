import api from './axios';

export interface NonCompliantItem {
  id: number;
  applicationId: number;
  applicationNumber: string;
  geoObjectId: number;
  nameUz: string;
  objectType: string;
  regionName: string | null;
  districtName: string | null;
  comment: string | null;
  markedBy: string;
  createdAt: string;
}

export async function toggleGeoFlag(
  applicationId: number,
  geoObjectId: number,
  comment?: string,
): Promise<{ flagged: boolean }> {
  const res = await api.post(
    `/geo-flags/applications/${applicationId}/geo-objects/${geoObjectId}/flag`,
    { comment },
  );
  return res.data.data;
}

export async function getApplicationFlags(
  applicationId: number,
): Promise<{ geoObjectId: number; comment: string | null; createdAt: string }[]> {
  const res = await api.get(`/geo-flags/applications/${applicationId}/flags`);
  return res.data.data;
}

export async function listNonCompliant(params?: {
  regionId?: number;
  districtId?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: NonCompliantItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const res = await api.get('/geo-flags/non-compliant', { params });
  return { data: res.data.data, meta: res.data.meta };
}
