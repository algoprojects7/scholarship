export const APP_NAME = 'Scholarship Management System';

export const PORTALS = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;

export type Portal = (typeof PORTALS)[keyof typeof PORTALS];
