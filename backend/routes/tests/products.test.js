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

describe('Products endpoints', () => {
  test('POST without stock should create product with stock default 0', async () => {
    const payload = {
      name: 'Gaming Mouse',
      description: 'RGB mouse',
      price: 999,
      category_id: 1,
      metadata: {}
    };

    const post = await request.post('/api/v1/products').send(payload);
    expect([200,201]).toContain(post.status);
    const id = post.body && (post.body.product_id || post.body.id || post.body.product);
    expect(id).toBeDefined();

    const get = await request.get(`/api/v1/products/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.stock === 0 || get.body.product?.stock === 0).toBeTruthy();
  });

  test('POST with attributes key should be accepted', async () => {
    const payload = {
      name: 'Keyboard',
      description: 'Mechanical keyboard',
      price: 1299,
      stock: 10,
      attributes: { layout: 'US' }
    };

    const post = await request.post('/api/v1/products').send(payload);
    expect([200,201]).toContain(post.status);
    const id = post.body && (post.body.product_id || post.body.id || post.body.product);
    expect(id).toBeDefined();

    const get = await request.get(`/api/v1/products/${id}`);
    expect(get.status).toBe(200);
    const product = get.body.product || get.body;
    expect(product).toBeDefined();
    expect(product.stock).toBeGreaterThanOrEqual(0);
  });

  test('POST missing name should return 400', async () => {
    const payload = { description: 'No name', price: 10 };
    const post = await request.post('/api/v1/products').send(payload);
    expect(post.status).toBe(400);
  });

  test('POST negative price should return 400', async () => {
    const payload = { name: 'Bad Price', price: -5 };
    const post = await request.post('/api/v1/products').send(payload);
    expect(post.status).toBe(400);
  });

  test('POST with non-existent category_id should return 400', async () => {
    const payload = { name: 'No Cat', price: 10, category_id: 9999999 };
    const post = await request.post('/api/v1/products').send(payload);
    expect(post.status).toBe(400);
  });
});
