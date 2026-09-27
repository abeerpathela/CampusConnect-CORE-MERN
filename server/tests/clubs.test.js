const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const Club = require('../models/Club');
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

describe('🏰 Clubs API Suite (/api/clubs)', () => {
  let adminToken;
  let studentToken;
  let studentUser;
  let createdClub;

  beforeEach(async () => {
    // 1. Create Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@chitkara.edu.in',
      password: 'adminPassword123',
      role: 'admin',
    });
    adminToken = adminRes.body.token;

    // 2. Create Student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Student User',
      email: 'student@chitkara.edu.in',
      password: 'studentPassword123',
      role: 'student',
    });
    studentToken = studentRes.body.token;
    studentUser = studentRes.body.user;

    // 3. Create Sample Club directly or via model
    createdClub = await Club.create({
      name: 'TeChitkara',
      category: 'Technical',
      tagline: 'Code, Build, Innovate',
      description: 'The premier technical student community.',
      leadCoordinator: 'Arnav Singhal',
      facultyAdvisor: 'Dr. Neeraj Kumar',
      email: 'techitkara@chitkara.edu.in',
      foundedYear: 2018,
      membersCount: 10,
      tags: ['Coding', 'Hackathon'],
      featured: true,
    });
  });

  describe('GET /api/clubs', () => {
    it('should return all clubs without authentication', async () => {
      const res = await request(app).get('/api/clubs');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('TeChitkara');
    });

    it('should filter clubs by category', async () => {
      await Club.create({
        name: 'Madian Sports',
        category: 'Sports',
        description: 'Sports and fitness club',
      });

      const res = await request(app).get('/api/clubs?category=Technical');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].category).toBe('Technical');
    });

    it('should search clubs by query keyword', async () => {
      await Club.create({
        name: 'Chromatic',
        category: 'Art and Craft',
        description: 'Canvas painting and sketching club',
        tags: ['Painting', 'Art'],
      });

      const res = await request(app).get('/api/clubs?search=sketching');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Chromatic');
    });
  });

  describe('GET /api/clubs/:id', () => {
    it('should fetch club by MongoDB ObjectId', async () => {
      const res = await request(app).get(`/api/clubs/${createdClub._id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('TeChitkara');
    });

    it('should fetch club by unique slug', async () => {
      const res = await request(app).get(`/api/clubs/${createdClub.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.slug).toBe('techitkara');
    });

    it('should return 404 for non-existent club identifier', async () => {
      const res = await request(app).get('/api/clubs/nonexistent-slug');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('RBAC Guards on Club Modifications', () => {
    it('should allow Admin to create a club (201)', async () => {
      const newClubData = {
        name: 'Nexora E-Cell',
        category: 'Entrepreneurship',
        description: 'Startup and incubation cell',
      };

      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newClubData);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Nexora E-Cell');
      expect(res.body.slug).toBe('nexora-e-cell');
    });

    it('should block Student from creating a club (403 Forbidden)', async () => {
      const newClubData = {
        name: 'Hacker Club',
        category: 'Technical',
        description: 'Unauthorized student club',
      };

      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(newClubData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden/i);
    });

    it('should block Student from deleting a club (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/clubs/${createdClub._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      // Verify club still exists
      const checkClub = await Club.findById(createdClub._id);
      expect(checkClub).not.toBeNull();
    });

    it('should allow Admin to delete a club (200)', async () => {
      const res = await request(app)
        .delete(`/api/clubs/${createdClub._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkClub = await Club.findById(createdClub._id);
      expect(checkClub).toBeNull();
    });
  });

  describe('POST /api/clubs/:id/join and /leave', () => {
    it('should allow student to join club and increment membersCount', async () => {
      const initialCount = createdClub.membersCount;

      const res = await request(app)
        .post(`/api/clubs/${createdClub._id}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/joined club/i);

      // Verify club membersCount incremented
      const updatedClub = await Club.findById(createdClub._id);
      expect(updatedClub.membersCount).toBe(initialCount + 1);

      // Verify user has club in joinedClubs
      const updatedUser = await User.findById(studentUser._id);
      expect(
        updatedUser.joinedClubs.some(
          (cId) => cId.toString() === createdClub._id.toString()
        )
      ).toBe(true);
    });

    it('should allow student to leave club and decrement membersCount', async () => {
      // First join
      await request(app)
        .post(`/api/clubs/${createdClub._id}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      const clubAfterJoin = await Club.findById(createdClub._id);

      // Then leave
      const res = await request(app)
        .post(`/api/clubs/${createdClub._id}/leave`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/left club/i);

      // Verify club membersCount decremented
      const clubAfterLeave = await Club.findById(createdClub._id);
      expect(clubAfterLeave.membersCount).toBe(clubAfterJoin.membersCount - 1);

      // Verify user no longer has club in joinedClubs
      const updatedUser = await User.findById(studentUser._id);
      expect(
        updatedUser.joinedClubs.some(
          (cId) => cId.toString() === createdClub._id.toString()
        )
      ).toBe(false);
    });
  });
});
