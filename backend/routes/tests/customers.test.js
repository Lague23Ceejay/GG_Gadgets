import 'dotenv/config';
import supertest from 'supertest';
import { initApp } from '../app.js';

let app;
let request;

beforeAll(async () => {
  app = await initApp();
  request = supertest(app);
});

afterAll(async () => {
  const pool = (await import('../config/db.js')).default;
  await pool.end();
});

describe('Customers endpoints', () => {
  test('GET /api/v1/customers returns 200 and an array', async () => {
    const res = await request.get('/api/v1/customers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/v1/customers creates a customer and GET /:id returns it', async () => {
    const unique = Date.now();
    const payload = {
      full_name: `Test User ${unique}`,
      email: `test+${unique}@example.com`,
      phone: '5551234567',
      metadata: {}
    };

    const post = await request.post('/api/v1/customers').send(payload);
    expect([200,201]).toContain(post.status);
    const id = post.body && (post.body.id || post.body.customer_id || post.body.customer);
    expect(id).toBeDefined();

    const get = await request.get(`/api/v1/customers/${id}`);
    expect(get.status).toBe(200);
    expect(get.body).toBeDefined();
  });
});
