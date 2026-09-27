const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const Announcement = require('../models/Announcement');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('📢 Announcements API Suite (/api/announcements)', () => {
  let adminToken;
  let studentToken;

  beforeEach(async () => {
    // 1. Create Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin Notice Head',
      email: 'admin.notice@chitkara.edu.in',
      password: 'adminPassword123',
      role: 'admin',
    });
    adminToken = adminRes.body.token;

    // 2. Create Student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Student Reader',
      email: 'student.reader@chitkara.edu.in',
      password: 'studentPassword123',
      role: 'student',
    });
    studentToken = studentRes.body.token;

    // 3. Create Sample Announcements (one unpinned, one pinned)
    await Announcement.create({
      title: 'General Library Notice',
      content: 'Extended library hours during exam week.',
      priority: 'General',
      isPinned: false,
      createdAt: new Date(Date.now() - 10000),
    });

    await Announcement.create({
      title: 'Urgent: Campus Gate Closure',
      content: 'North gate closed for maintenance.',
      priority: 'Urgent',
      isPinned: true,
      createdAt: new Date(Date.now() - 50000),
    });
  });

  describe('GET /api/announcements', () => {
    it('should return announcements sorted by isPinned first, then date', async () => {
      const res = await request(app).get('/api/announcements');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);

      // Pinned notice should be returned first despite older createdAt
      expect(res.body[0].isPinned).toBe(true);
      expect(res.body[0].title).toBe('Urgent: Campus Gate Closure');

      expect(res.body[1].isPinned).toBe(false);
      expect(res.body[1].title).toBe('General Library Notice');
    });
  });

  describe('POST /api/announcements', () => {
    it('should allow Admin to publish an announcement', async () => {
      const noticeData = {
        title: 'Tech Fest Registration Extended',
        content: 'Deadline extended to this Friday.',
        priority: 'Event Alert',
        isPinned: true,
      };

      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(noticeData);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Tech Fest Registration Extended');
      expect(res.body.priority).toBe('Event Alert');
      expect(res.body.isPinned).toBe(true);
    });

    it('should block Student from publishing an announcement (403 Forbidden)', async () => {
      const noticeData = {
        title: 'Fake Student Notice',
        content: 'No classes tomorrow.',
      };

      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(noticeData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/announcements/:id', () => {
    it('should allow Admin to delete an announcement', async () => {
      const notice = await Announcement.findOne({ title: 'General Library Notice' });

      const res = await request(app)
        .delete(`/api/announcements/${notice._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkNotice = await Announcement.findById(notice._id);
      expect(checkNotice).toBeNull();
    });

    it('should block Student from deleting an announcement (403 Forbidden)', async () => {
      const notice = await Announcement.findOne({ title: 'General Library Notice' });

      const res = await request(app)
        .delete(`/api/announcements/${notice._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      const checkNotice = await Announcement.findById(notice._id);
      expect(checkNotice).not.toBeNull();
    });
  });
});
