import { AdminType, Permission, UserRole } from '@scholarship/shared';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  adminType?: AdminType;
  permissions?: Permission[];
}
