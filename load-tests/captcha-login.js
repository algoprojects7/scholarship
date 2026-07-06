import { check, sleep } from 'k6';
import http from 'k6/http';
import {
  BASE_URL,
  ADMIN_CREDENTIALS,
  CAPTCHA_BYPASS_CODE,
  ADMIN_JSON_HEADERS,
} from './config.js';

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    checks: ['rate==1'],
  },
};

export default function () {
  const captchaRes = http.get(`${BASE_URL}/auth/captcha`, {
    tags: { name: 'GET /auth/captcha' },
  });

  check(captchaRes, {
    'captcha status 200': (r) => r.status === 200,
    'captcha id present': (r) => r.json('captchaId') !== undefined,
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
    {
      headers: ADMIN_JSON_HEADERS,
      tags: { name: 'POST /auth/login' },
    },
  );

  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'access token present': (r) => r.json('accessToken') !== undefined,
    'admin user returned': (r) => r.json('user.email') === ADMIN_CREDENTIALS.email,
  });

  sleep(1);
}
