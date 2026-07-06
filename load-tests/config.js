import http from 'k6/http';
import { check } from 'k6';

/** API base URL — override with `k6 run -e BASE_URL=...` */
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export const ADMIN_CREDENTIALS = {
  email: __ENV.ADMIN_EMAIL || 'super@scholarship.local',
  password: __ENV.ADMIN_PASSWORD || 'SuperAdmin@123',
};

/**
 * Placeholder captcha code — accepted only when the API runs with
 * CAPTCHA_BYPASS=test (see load-tests/README.md).
 */
export const CAPTCHA_BYPASS_CODE = 'E2ETST';

/** Shared JSON request headers for admin portal auth flows. */
export const ADMIN_JSON_HEADERS = {
  'Content-Type': 'application/json',
  'X-Portal': 'admin',
};

/**
 * Fetch captcha challenge and log in as super admin.
 * Requires CAPTCHA_BYPASS=test on the API process.
 */
export function adminLogin() {
  const captchaRes = http.get(`${BASE_URL}/auth/captcha`);
  check(captchaRes, {
    'captcha status 200': (r) => r.status === 200,
  });

  const captcha = captchaRes.json();

  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      captchaId: captcha.captchaId,
      captchaCode: CAPTCHA_BYPASS_CODE,
    }),
    { headers: ADMIN_JSON_HEADERS },
  );

  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'access token present': (r) => r.json('accessToken') !== undefined,
  });

  return {
    accessToken: loginRes.json('accessToken'),
    loginRes,
    captchaRes,
  };
}
