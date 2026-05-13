export type UserRole =
  | 'admin'
  | 'superuser'
  | 'dkp_filial'
  | 'dkp_regional'
  | 'district_commission'
  | 'district_hokimlik'
  | 'regional_commission'
  | 'regional_hokimlik'
  | 'kadastr_agency'
  | 'dkp_central';

export const ROLES = {
  ADMIN:               'admin',
  SUPERUSER:           'superuser',
  DKP_FILIAL:          'dkp_filial',
  DKP_REGIONAL:        'dkp_regional',
  DKP_CENTRAL:         'dkp_central',
  DISTRICT_COMMISSION: 'district_commission',
  DISTRICT_HOKIMLIK:   'district_hokimlik',
  REGIONAL_COMMISSION: 'regional_commission',
  REGIONAL_HOKIMLIK:   'regional_hokimlik',
  KADASTR_AGENCY:      'kadastr_agency',
} as const satisfies Record<string, UserRole>;

export const DISTRICT_ROLES: UserRole[] = [
  ROLES.DKP_FILIAL,
  ROLES.DISTRICT_COMMISSION,
  ROLES.DISTRICT_HOKIMLIK,
];

export const REGIONAL_ROLES: UserRole[] = [
  ROLES.DKP_REGIONAL,
  ROLES.REGIONAL_COMMISSION,
  ROLES.REGIONAL_HOKIMLIK,
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:               'Administrator',
  superuser:           'Portfolio kuzatuvchi',
  dkp_filial:          'DKP filial xodimi',
  dkp_regional:        'DKP viloyat filiali',
  district_commission: 'Tuman komissiyasi',
  district_hokimlik:   'Tuman hokimligi',
  regional_commission: 'Viloyat komissiyasi',
  regional_hokimlik:   'Viloyat hokimligi',
  kadastr_agency:      'Kadastr agentligi',
  dkp_central:         'DKP markaziy apparat',
};
