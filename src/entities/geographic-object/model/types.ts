import type { GeoJSON } from '@/shared/types/common';
import type { ObjectType } from '@/entities/object-type/model/types';
import type { Region, District } from '@/entities/location/model/types';
import type { User } from '@/entities/user/model/types';
import type { Application } from '@/entities/application/model/types';

export type { GeoJSON };

export interface GeographicObject {
  id: number;
  applicationId: number | null;
  nameUz: string | null;
  nameKrill: string | null;
  objectTypeId: number | null;
  objectType?: ObjectType;
  regionId: number;
  region?: Region;
  districtId: number;
  district?: District;
  geometry: GeoJSON | null;
  registryNumber: string | null;
  soato: string | null;
  basisDocument: string | null;
  affiliation: string | null;
  historicalName: string | null;
  comment: string | null;
  existsInRegistry: boolean | null;
  createdBy: number;
  creator?: Pick<User, 'id' | 'username' | 'fullName' | 'role'>;
  application?: Application;
  createdAt: string;
  updatedAt: string;
}
