import request from 'supertest';
import app from './index';

// Mock environment variables
process.env.TENANT_ID = 'test-tenant';
process.env.AUTH_URL = 'http://localhost:3001';
process.env.SERVER_URL = 'http://localhost:3030';
process.env.WEB_URL = 'https://test-tenant.localhost';
process.env.PORT = '3031';

describe('Registry Service', () => {

  it('should return 200 OK for health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', tenantId: 'test-tenant' });
  });

  it('should return endpoints for the default tenant', async () => {
    const response = await request(app).get('/endpoints');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      tenantId: 'test-tenant',
      authUrl: 'http://localhost:3001',
      serverUrl: 'http://localhost:3030',
      webUrl: 'https://test-tenant.localhost',
      apiVersion: 'v1',
    });
  });

  it('should return endpoints for a specific tenant', async () => {
    const response = await request(app).get('/endpoints?tenant=custom-tenant');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      tenantId: 'custom-tenant',
      authUrl: 'http://localhost:3001',
      serverUrl: 'http://localhost:3030',
      webUrl: 'https://test-tenant.localhost',
      apiVersion: 'v1',
    });
  });

  it('should return the OpenAPI spec', async () => {
    const response = await request(app).get('/openapi.yaml');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/yaml');
  });

  it('should handle errors', async () => {
    // This will trigger a validation error because the OpenAPI spec requires a tenant parameter
    const response = await request(app).post('/endpoints');
    expect(response.status).toBe(405); // Method Not Allowed
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('status');
  });

  it('should handle 404 errors', async () => {
    const response = await request(app).get('/nonexistent-path');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('status');
  });
});
