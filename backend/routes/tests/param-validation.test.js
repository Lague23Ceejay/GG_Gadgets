import 'dotenv/config';
import supertest from 'supertest';
import { initApp } from '../app.js';

let app, request;

beforeAll(async () => {
  app = await initApp();
  request = supertest(app);
});

afterAll(async () => {
  const pool = (await import('../config/db.js')).default;
  await pool.end();
});

describe('Param validation', () => {
  test('GET /products/:id with non-numeric id returns 400', async () => {
    const res = await request.get('/api/v1/products/abc');
    expect(res.status).toBe(400);
  });

  test('GET /customers/:id with non-numeric id returns 400', async () => {
    const res = await request.get('/api/v1/customers/abc');
    expect(res.status).toBe(400);
  });

  test('GET /categories/:id with non-numeric id returns 400', async () => {
    const res = await request.get('/api/v1/categories/abc');
    expect(res.status).toBe(400);
  });

  test('GET /orders/:id with non-numeric id returns 400', async () => {
    const res = await request.get('/api/v1/orders/abc');
    expect(res.status).toBe(400);
  });

  test('DELETE /users/:id with non-numeric id returns 400', async () => {
    const res = await request.delete('/api/v1/users/abc');
    expect(res.status).toBe(400);
  });
});
