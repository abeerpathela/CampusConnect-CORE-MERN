const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const Event = require('../models/Event');
const Club = require('../models/Club');
const User = require('../models/User');
const Registration = require('../models/Registration');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('🎟️ Events & Ticket Registration API Suite (/api/events)', () => {
  let adminToken;
  let studentToken;
  let studentUser;
  let testClub;
  let testEvent;

  beforeEach(async () => {
    // 1. Create Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin Host',
      email: 'admin.event@chitkara.edu.in',
      password: 'adminPassword123',
      role: 'admin',
    });
    adminToken = adminRes.body.token;

    // 2. Create Student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Aarav Sharma',
      email: 'aarav.sharma@chitkara.edu.in',
      password: 'studentPassword123',
      role: 'student',
      rollNo: '2310990001',
      department: 'Computer Science & Engineering',
    });
    studentToken = studentRes.body.token;
    studentUser = studentRes.body.user;

    // 3. Create Host Club
    testClub = await Club.create({
      name: 'TeChitkara',
      category: 'Technical',
      description: 'Technical Coding Club',
    });

    // 4. Create Standard Event (Capacity: 2)
    testEvent = await Event.create({
      title: 'TechNexus Hackathon 2026',
      clubId: testClub._id,
      clubName: testClub.name,
      category: 'Technical',
      shortDescription: '36-hour codeathon',
      description: 'Annual National Codeathon with grand prizes',
      date: '2026-10-15',
      time: '09:00 AM',
      venue: 'Turing Innovation Lab',
      capacity: 2,
      registeredCount: 0,
      fee: 'Free',
      isRegistrationOpen: true,
      tags: ['Hackathon', 'Coding'],
    });
  });

  describe('GET /api/events', () => {
    it('should retrieve all events publicly', async () => {
      const res = await request(app).get('/api/events');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('TechNexus Hackathon 2026');
    });

    it('should search events by keyword', async () => {
      const res = await request(app).get('/api/events?search=Hackathon');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should filter events by category', async () => {
      const res = await request(app).get('/api/events?category=Technical');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);

      const emptyRes = await request(app).get('/api/events?category=Sports');
      expect(emptyRes.status).toBe(200);
      expect(emptyRes.body.length).toBe(0);
    });
  });

  describe('POST /api/events (Admin Creation & RBAC)', () => {
    it('should allow Admin to schedule an event', async () => {
      const newEventData = {
        title: 'Spardha Futsal Championship',
        clubId: testClub._id,
        category: 'Sports',
        description: 'Inter-department 5v5 soccer league',
        date: '2026-10-20',
        time: '05:00 PM',
        venue: 'AstroTurf Arena',
        capacity: 50,
      };

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newEventData);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Spardha Futsal Championship');
      expect(res.body.registeredCount).toBe(0);
    });

    it('should block Student from creating an event (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Event',
          clubId: testClub._id,
          category: 'Cultural',
          description: 'Blocked student event',
          date: '2026-10-25',
          time: '10:00 AM',
          venue: 'Hostel Lawn',
          capacity: 10,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/events/:id/register (Event Ticket Booking Flow)', () => {
    it('should successfully register a student, increment count, and generate formatted ticket', async () => {
      const res = await request(app)
        .post(`/api/events/${testEvent._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.registration).toBeDefined();

      const reg = res.body.registration;

      // 1. Verify Ticket Number Format: CC-<CATEGORY_FIRST_4_LETTERS_UPPERCASE>-<RANDOM_4_DIGITS>
      // e.g. CC-TECH-1234
      expect(reg.ticketNumber).toMatch(/^CC-TECH-\d{4}$/);

      // 2. Verify QR Code Format: CAMPUSCONNECT-TICKET-<ticketNumber>-<USER_NAME>
      expect(reg.qrCodeData).toBe(
        `CAMPUSCONNECT-TICKET-${reg.ticketNumber}-AARAV-SHARMA`
      );

      // 3. Verify event details stored in ticket
      expect(reg.eventId.toString()).toBe(testEvent._id.toString());
      expect(reg.studentEmail).toBe('aarav.sharma@chitkara.edu.in');
      expect(reg.status).toBe('Confirmed');

      // 4. Verify Event registeredCount incremented to 1
      const updatedEvent = await Event.findById(testEvent._id);
      expect(updatedEvent.registeredCount).toBe(1);

      // 5. Verify User registeredEvents contains eventId
      const updatedUser = await User.findById(studentUser._id);
      expect(
        updatedUser.registeredEvents.some(
          (eId) => eId.toString() === testEvent._id.toString()
        )
      ).toBe(true);
    });

    it('should block duplicate registrations for the same user (400 Bad Request)', async () => {
      // First registration: Success
      await request(app)
        .post(`/api/events/${testEvent._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Second registration: Duplicate attempt
      const duplicateRes = await request(app)
        .post(`/api/events/${testEvent._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toMatch(/already registered/i);

      // Verify registeredCount didn't increment again
      const eventInDb = await Event.findById(testEvent._id);
      expect(eventInDb.registeredCount).toBe(1);
    });

    it('should enforce capacity limits and reject registrations when event is full (400)', async () => {
      // Create second student
      const s2Res = await request(app).post('/api/auth/register').send({
        name: 'Second Student',
        email: 'second.student@chitkara.edu.in',
        password: 'password123',
        role: 'student',
      });
      const student2Token = s2Res.body.token;

      // Create third student
      const s3Res = await request(app).post('/api/auth/register').send({
        name: 'Third Student',
        email: 'third.student@chitkara.edu.in',
        password: 'password123',
        role: 'student',
      });
      const student3Token = s3Res.body.token;

      // Seat 1/2: Fill with Student 1
      await request(app)
        .post(`/api/events/${testEvent._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Seat 2/2: Fill with Student 2 (Full)
      await request(app)
        .post(`/api/events/${testEvent._id}/register`)
        .set('Authorization', `Bearer ${student2Token}`);

      const fullEvent = await Event.findById(testEvent._id);
      expect(fullEvent.registeredCount).toBe(2);
      expect(fullEvent.capacity).toBe(2);

      // Seat 3 attempt: Student 3 tries to register on full capacity
      const overflowRes = await request(app)
        .post(`/api/events/${testEvent._id}/register`)
        .set('Authorization', `Bearer ${student3Token}`);

      expect(overflowRes.status).toBe(400);
      expect(overflowRes.body.success).toBe(false);
      expect(overflowRes.body.message).toMatch(/full capacity/i);
    });

    it('should reject registration if registration is closed (400)', async () => {
      testEvent.isRegistrationOpen = false;
      await testEvent.save();

      const res = await request(app)
        .post(`/api/events/${testEvent._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/closed/i);
    });
  });

  describe('GET /api/events/:id/attendees (Admin Attendee Roster)', () => {
    it('should allow Admin to view attendee roster for an event', async () => {
      // Register student
      await request(app)
        .post(`/api/events/${testEvent._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      const res = await request(app)
        .get(`/api/events/${testEvent._id}/attendees`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].studentEmail).toBe('aarav.sharma@chitkara.edu.in');
    });

    it('should block Student from viewing attendee roster (403)', async () => {
      const res = await request(app)
        .get(`/api/events/${testEvent._id}/attendees`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/events/:id (Cascade clean up registrations)', () => {
    it('should delete event and associated registration records', async () => {
      // Register student first
      await request(app)
        .post(`/api/events/${testEvent._id}/register`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Verify registration exists
      const initialRegCount = await Registration.countDocuments({
        eventId: testEvent._id,
      });
      expect(initialRegCount).toBe(1);

      // Admin deletes event
      const deleteRes = await request(app)
        .delete(`/api/events/${testEvent._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify event is removed
      const eventCheck = await Event.findById(testEvent._id);
      expect(eventCheck).toBeNull();

      // Verify associated registrations are cleaned up
      const regCheck = await Registration.countDocuments({
        eventId: testEvent._id,
      });
      expect(regCheck).toBe(0);
    });
  });
});
