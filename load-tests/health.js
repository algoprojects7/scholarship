import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from './config.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<300'],
    checks: ['rate==1'],
  },
};

const HEALTH_ENDPOINTS = ['/health', '/health/live', '/health/ready'];

export default function () {
  for (const path of HEALTH_ENDPOINTS) {
    const res = http.get(`${BASE_URL}${path}`, { tags: { name: path } });

    check(res, {
      [`${path} status 200`]: (r) => r.status === 200,
    });
  }

  sleep(1);
}
