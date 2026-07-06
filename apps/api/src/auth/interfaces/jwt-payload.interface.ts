import { AdminType, UserRole } from '@scholarship/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  adminType?: AdminType;
  jti: string;
}
