import type { User } from './types';

export type AuthUser = User;

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
