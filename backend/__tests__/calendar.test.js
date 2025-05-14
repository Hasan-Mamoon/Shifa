import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import CalendarEvent from '../models/calendar.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let authToken;
let testUserId;

describe('Calendar Routes', () => {
  beforeAll(async () => {
    // Create an in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Close any existing connections
    await mongoose.disconnect();
    
    // Set the test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    
    await mongoose.connect(mongoUri);

    // Create a test user ID and token
    testUserId = new mongoose.Types.ObjectId();
    authToken = jwt.sign(
      { id: testUserId, role: 'patient' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(async () => {
    // Clear the database before each test
    await CalendarEvent.deleteMany({});
  });

  afterAll(async () => {
    // Cleanup and close connections
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Test data
  const sampleEvent = {
    title: 'Test Event',
    date: '2024-03-20'
  };

  describe('GET /', () => {
    it('should get all events for a given month range', async () => {
      // Create test events
      await CalendarEvent.create([
        { title: 'Event 1', date: '2024-03-01', userId: testUserId },
        { title: 'Event 2', date: '2024-03-15', userId: testUserId },
        { title: 'Event 3', date: '2024-04-01', userId: testUserId } // Outside range
      ]);

      const response = await request(app)
        .get('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          start: '2024-03-01',
          end: '2024-03-31'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      // Don't test exact order, just check if both events are present
      const titles = response.body.map(event => event.title);
      expect(titles).toContain('Event 1');
      expect(titles).toContain('Event 2');
    });

    it('should handle invalid date range', async () => {
      const response = await request(app)
        .get('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          start: 'invalid-date',
          end: '2024-03-31'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return empty array when no events in range', async () => {
      const response = await request(app)
        .get('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          start: '2024-05-01',
          end: '2024-05-31'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/calendar')
        .query({
          start: '2024-03-01',
          end: '2024-03-31'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /:date', () => {
    it('should get events for a specific date', async () => {
      // Create test events
      await CalendarEvent.create([
        { title: 'Event 1', date: '2024-03-20', userId: testUserId },
        { title: 'Event 2', date: '2024-03-20', userId: testUserId },
        { title: 'Event 3', date: '2024-03-21', userId: testUserId }
      ]);

      const response = await request(app)
        .get('/calendar/2024-03-20')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      const titles = response.body.map(event => event.title);
      expect(titles).toContain('Event 1');
      expect(titles).toContain('Event 2');
    });

    it('should return empty array for date with no events', async () => {
      const response = await request(app)
        .get('/calendar/2024-03-22')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should handle invalid date format', async () => {
      const response = await request(app)
        .get('/calendar/invalid-date')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /', () => {
    it('should create a new event', async () => {
      const response = await request(app)
        .post('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sampleEvent);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(sampleEvent.title);
      expect(response.body.date).toBe(sampleEvent.date);
      expect(response.body.userId).toBe(testUserId.toString());
      expect(response.body).toHaveProperty('_id');

      // Verify event was saved to database
      const savedEvent = await CalendarEvent.findById(response.body._id);
      expect(savedEvent).toBeTruthy();
      expect(savedEvent.title).toBe(sampleEvent.title);
      expect(savedEvent.userId.toString()).toBe(testUserId.toString());
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Missing Date' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid date format', async () => {
      const response = await request(app)
        .post('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Date',
          date: 'not-a-date'
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Invalid Date');
      expect(response.body.date).toBe('not-a-date');
      expect(response.body.userId).toBe(testUserId.toString());
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete an existing event', async () => {
      // Create an event first
      const event = await CalendarEvent.create({
        ...sampleEvent,
        userId: testUserId
      });

      const response = await request(app)
        .delete(`/calendar/${event._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event deleted');

      // Verify event is deleted
      const deletedEvent = await CalendarEvent.findById(event._id);
      expect(deletedEvent).toBeNull();
    });

    it('should handle non-existent event ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/calendar/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid event ID format', async () => {
      const response = await request(app)
        .delete('/calendar/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle empty ID parameter', async () => {
      const response = await request(app)
        .delete('/calendar/')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should not allow deleting events owned by other users', async () => {
      // Create an event owned by a different user
      const otherUserId = new mongoose.Types.ObjectId();
      const event = await CalendarEvent.create({
        ...sampleEvent,
        userId: otherUserId
      });

      const response = await request(app)
        .delete(`/calendar/${event._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');

      // Verify event still exists
      const existingEvent = await CalendarEvent.findById(event._id);
      expect(existingEvent).toBeTruthy();
    });
  });
}); 