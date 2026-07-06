import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, adminLogin } from './config.js';

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    checks: ['rate==1'],
  },
};

export default function () {
  const { accessToken } = adminLogin();

  const listRes = http.get(`${BASE_URL}/admin/applications`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Portal': 'admin',
    },
    tags: { name: 'GET /admin/applications' },
  });

  check(listRes, {
    'applications status 200': (r) => r.status === 200,
    'applications payload has items': (r) => Array.isArray(r.json('items')),
  });

  sleep(1);
}
