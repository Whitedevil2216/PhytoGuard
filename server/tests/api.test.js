// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import sharp from 'sharp';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { createExpressApp } from '../src/app.js';
import { User } from '../src/models/User.js';

let app;
let validJpegBuffer;
let growerToken = '';
let secondGrowerToken = '';
let adminToken = '';
let createdPredictionId = '';
let createdDiseaseId = '';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDatabase();
  app = createExpressApp();

  // Generate a genuine 256x256 RGB JPEG image buffer using Sharp
  validJpegBuffer = await sharp({
    create: {
      width: 256,
      height: 256,
      channels: 3,
      background: { r: 34, g: 120, b: 56 },
    },
  })
    .jpeg()
    .toBuffer();

  // Provision an admin account directly via model (never via public registration)
  const adminUser = await User.create({
    name: 'Test Security Admin',
    email: 'security.admin@phytoguard.edu',
    passwordHash: await User.hashPassword('AdminStrong123!'),
    role: 'admin',
    status: 'active',
  });

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminUser.email, password: 'AdminStrong123!' });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  vi.restoreAllMocks();
  await disconnectDatabase();
});

describe('Backend Authentication, RBAC, Upload Security, Prediction & IDOR Suite', () => {
  it('registers a new user, hashes password, and blocks privilege escalation via role field', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Lakshmi Narayanan',
      email: 'lakshmi@farm.org',
      password: 'SecurePassword99',
      role: 'admin', // Malicious privilege-escalation attempt
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']?.[0]).toContain('HttpOnly');
    growerToken = res.body.token;

    // Register a second standard user for IDOR ownership verification
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Second Grower',
      email: 'second@farm.org',
      password: 'SecurePassword99',
    });
    expect(res2.status).toBe(201);
    secondGrowerToken = res2.body.token;
  });

  it('rejects duplicate email registration with HTTP 409', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: 'lakshmi@farm.org',
      password: 'SecurePassword99',
    });

    expect(res.status).toBe(409);
    expect(res.body.errorCode).toBe('DUPLICATE_EMAIL');
  });

  it('authenticates valid credentials and rejects wrong passwords', async () => {
    const okRes = await request(app).post('/api/auth/login').send({
      email: 'lakshmi@farm.org',
      password: 'SecurePassword99',
    });
    expect(okRes.status).toBe(200);
    expect(okRes.body.user.email).toBe('lakshmi@farm.org');

    const badRes = await request(app).post('/api/auth/login').send({
      email: 'lakshmi@farm.org',
      password: 'WrongPassword123',
    });
    expect(badRes.status).toBe(401);
    expect(badRes.body.errorCode).toBe('INVALID_CREDENTIALS');
  });

  it('blocks unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);

    const predRes = await request(app).get('/api/predictions');
    expect(predRes.status).toBe(401);
  });

  it('enforces role-based authorization on admin and disease mutation endpoints', async () => {
    const adminStatsRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${growerToken}`);
    expect(adminStatsRes.status).toBe(403);

    const createDiseaseRes = await request(app)
      .post('/api/diseases')
      .set('Authorization', `Bearer ${growerToken}`)
      .send({
        cropName: 'Rice',
        diseaseName: 'Blast',
        classLabel: 'Rice___Blast',
        description: 'Unauthorized attempt by non-admin user.',
        symptoms: ['Spindle lesions'],
        prevention: ['Resistant varieties'],
        management: ['Balanced nitrogen'],
      });
    expect(createDiseaseRes.status).toBe(403);
  });

  it('rejects disguised non-image files claiming image/jpeg MIME type via magic-byte check', async () => {
    const fakeScriptPayload = Buffer.from('<?php echo "malicious upload"; ?>', 'utf-8');

    const res = await request(app)
      .post('/api/predict')
      .set('Authorization', `Bearer ${growerToken}`)
      .attach('image', fakeScriptPayload, {
        filename: 'disguised_shell.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('INVALID_IMAGE_SIGNATURE');
  });

  it('returns honest 503 setup error (never fake predictions) when FastAPI service is offline', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('connect ECONNREFUSED 127.0.0.1:8000'));

    const res = await request(app)
      .post('/api/predict')
      .set('Authorization', `Bearer ${growerToken}`)
      .attach('image', validJpegBuffer, {
        filename: 'leaf_sample.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(503);
    expect(res.body.errorCode).toBe('MODEL_SERVICE_UNAVAILABLE');
    global.fetch = originalFetch;
  });

  it('processes a genuine CNN prediction via FastAPI integration and links MongoDB disease guidance', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        classLabel: 'Tomato___Early_blight',
        cropName: 'Tomato',
        diseaseName: 'Early Blight',
        confidence: 0.914,
        topPredictions: [
          {
            classLabel: 'Tomato___Early_blight',
            cropName: 'Tomato',
            diseaseName: 'Early Blight',
            confidence: 0.914,
          },
        ],
        modelVersion: 'plantvillage-cnn-test-v1',
      }),
    });

    const res = await request(app)
      .post('/api/predict')
      .set('Authorization', `Bearer ${growerToken}`)
      .attach('image', validJpegBuffer, {
        filename: 'tomato_leaf.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.isDemo).toBe(false);
    expect(res.body.prediction.classLabel).toBe('Tomato___Early_blight');
    expect(res.body.prediction.confidence).toBeCloseTo(0.914, 3);
    expect(res.body.prediction.status).toBe('completed');
    expect(res.body.disease.scientificName).toContain('Alternaria');
    createdPredictionId = res.body.prediction.id;

    global.fetch = originalFetch;
  });

  it('enforces strict user ownership checks (prevents IDOR viewing and deletion)', async () => {
    const viewAttempt = await request(app)
      .get(`/api/predictions/${createdPredictionId}`)
      .set('Authorization', `Bearer ${secondGrowerToken}`);
    expect(viewAttempt.status).toBe(403);

    const deleteAttempt = await request(app)
      .delete(`/api/predictions/${createdPredictionId}`)
      .set('Authorization', `Bearer ${secondGrowerToken}`);
    expect(deleteAttempt.status).toBe(403);

    // Owner can retrieve and list their own prediction
    const ownerView = await request(app)
      .get(`/api/predictions/${createdPredictionId}`)
      .set('Authorization', `Bearer ${growerToken}`);
    expect(ownerView.status).toBe(200);
    expect(ownerView.body.prediction.id).toBe(createdPredictionId);
  });

  it('supports Disease Library search, crop filter, and Admin CRUD', async () => {
    const listRes = await request(app).get('/api/diseases?crop=Tomato');
    expect(listRes.status).toBe(200);
    expect(listRes.body.diseases.length).toBeGreaterThan(0);

    const createRes = await request(app)
      .post('/api/diseases')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        cropName: 'Rice',
        diseaseName: 'Brown Spot',
        scientificName: 'Bipolaris oryzae',
        classLabel: 'Rice___Brown_spot',
        description: 'Fungal foliar spot disease common in nutrient-deficient paddy soils.',
        symptoms: ['Oval dark brown spots with yellow halo on leaves'],
        prevention: ['Ensure balanced soil potassium and silicon fertility'],
        management: ['Use certified clean seed and consult local paddy extension specialists'],
      });
    expect(createRes.status).toBe(201);
    createdDiseaseId = createRes.body.disease.id;

    const updateRes = await request(app)
      .put(`/api/diseases/${createdDiseaseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ diseaseName: 'Paddy Brown Spot' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.disease.diseaseName).toBe('Paddy Brown Spot');

    const delRes = await request(app)
      .delete(`/api/diseases/${createdDiseaseId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(delRes.status).toBe(200);
  });

  it('serves admin stats and prevents administrators from demoting or deactivating themselves', async () => {
    const statsRes = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.stats.totalUsers).toBeGreaterThanOrEqual(3);
    expect(statsRes.body.stats.genuinePredictions).toBe(1);

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    const adminId = meRes.body.user.id;

    const selfDemote = await request(app)
      .patch(`/api/admin/users/${adminId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'user' });
    expect(selfDemote.status).toBe(400);
    expect(selfDemote.body.errorCode).toBe('SELF_DEMOTION_BLOCKED');

    const selfDeactivate = await request(app)
      .patch(`/api/admin/users/${adminId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'deactivated' });
    expect(selfDeactivate.status).toBe(400);
    expect(selfDeactivate.body.errorCode).toBe('SELF_DEACTIVATION_BLOCKED');
  });

  it('handles malformed IDs and unknown API routes safely without leaking stack traces', async () => {
    const badIdRes = await request(app)
      .get('/api/predictions/not-a-valid-mongo-id')
      .set('Authorization', `Bearer ${growerToken}`);
    expect(badIdRes.status).toBe(400);
    expect(badIdRes.body.stack).toBeUndefined();

    const unknownRoute = await request(app).get('/api/non-existent-endpoint');
    expect(unknownRoute.status).toBe(404);
    expect(unknownRoute.body.errorCode).toBe('ENDPOINT_NOT_FOUND');

    // Owner deletes their prediction cleanly
    const ownerDelete = await request(app)
      .delete(`/api/predictions/${createdPredictionId}`)
      .set('Authorization', `Bearer ${growerToken}`);
    expect(ownerDelete.status).toBe(200);
  });
});
