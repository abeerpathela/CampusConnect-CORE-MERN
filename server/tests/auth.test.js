const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../models/User');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('🔐 Auth API Suite (/api/auth)', () => {
  const mockUser = {
    name: 'Test Student',
    email: 'student.test@chitkara.edu.in',
    password: 'password123',
    role: 'student',
    rollNo: '2310990099',
    department: 'Computer Science & Engineering',
    semester: '4th Semester',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(mockUser.email.toLowerCase());
      expect(res.body.user.password).toBeUndefined(); // Password must never be exposed

      // Verify user is in database
      const dbUser = await User.findOne({ email: mockUser.email.toLowerCase() });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe(mockUser.name);
    });

    it('should reject registration if email is already in use', async () => {
      await request(app).post('/api/auth/register').send(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@chitkara.edu.in' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(mockUser);
    });

    it('should authenticate valid credentials and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(mockUser.email.toLowerCase());
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject login with wrong password (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: 'wrong_password',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login with non-existent email (401)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@chitkara.edu.in',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me (Protected Route & Token Verification)', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send(mockUser);
      token = res.body.token;
    });

    it('should return user profile when valid Bearer token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(mockUser.email.toLowerCase());
      expect(res.body.name).toBe(mockUser.name);
    });

    it('should return 401 Unauthorized when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no token provided/i);
    });

    it('should return 401 Unauthorized when invalid/forged token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_forged_jwt_token_12345');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token failed/i);
    });
  });
});
