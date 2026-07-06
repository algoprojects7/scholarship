export const REFRESH_COOKIE_NAME = 'refresh_token';
export const PORTAL_HEADER = 'x-portal';
export const BCRYPT_ROUNDS = 12;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export enum Portal {
  STUDENT = 'student',
  ADMIN = 'admin',
}
