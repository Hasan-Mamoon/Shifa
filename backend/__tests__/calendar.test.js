import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import CalendarEvent from '../models/calendar.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

describe('Calendar Routes', () => {
  beforeAll(async () => {
    // Create an in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Close any existing connections
    await mongoose.disconnect();
    
    // Set the test environment
    process.env.NODE_ENV = 'test';
    
    await mongoose.connect(mongoUri);
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
        { title: 'Event 1', date: '2024-03-01' },
        { title: 'Event 2', date: '2024-03-15' },
        { title: 'Event 3', date: '2024-04-01' } // Outside range
      ]);

      const response = await request(app)
        .get('/calendar')
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
        .query({
          start: 'invalid-date',
          end: '2024-03-31'
        });

      // API returns empty array for invalid dates
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return empty array when no events in range', async () => {
      const response = await request(app)
        .get('/calendar')
        .query({
          start: '2024-05-01',
          end: '2024-05-31'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /:date', () => {
    it('should get events for a specific date', async () => {
      // Create test events
      await CalendarEvent.create([
        { title: 'Event 1', date: '2024-03-20' },
        { title: 'Event 2', date: '2024-03-20' },
        { title: 'Event 3', date: '2024-03-21' }
      ]);

      const response = await request(app)
        .get('/calendar/2024-03-20');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      // Don't test exact order, just check if both events are present
      const titles = response.body.map(event => event.title);
      expect(titles).toContain('Event 1');
      expect(titles).toContain('Event 2');
    });

    it('should return empty array for date with no events', async () => {
      const response = await request(app)
        .get('/calendar/2024-03-22');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should handle invalid date format', async () => {
      const response = await request(app)
        .get('/calendar/invalid-date');

      // API returns empty array for invalid dates
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /', () => {
    it('should create a new event', async () => {
      const response = await request(app)
        .post('/calendar')
        .send(sampleEvent);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(sampleEvent.title);
      expect(response.body.date).toBe(sampleEvent.date);
      expect(response.body).toHaveProperty('_id');

      // Verify event was saved to database
      const savedEvent = await CalendarEvent.findById(response.body._id);
      expect(savedEvent).toBeTruthy();
      expect(savedEvent.title).toBe(sampleEvent.title);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/calendar')
        .send({ title: 'Missing Date' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid date format', async () => {
      const response = await request(app)
        .post('/calendar')
        .send({
          title: 'Invalid Date',
          date: 'not-a-date'
        });

      // API accepts any string as date
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', 'Invalid Date');
      expect(response.body).toHaveProperty('date', 'not-a-date');
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/calendar')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete an existing event', async () => {
      // Create an event first
      const event = await CalendarEvent.create(sampleEvent);

      const response = await request(app)
        .delete(`/calendar/${event._id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event deleted');

      // Verify event is deleted
      const deletedEvent = await CalendarEvent.findById(event._id);
      expect(deletedEvent).toBeNull();
    });

    it('should handle non-existent event ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/calendar/${nonExistentId}`);

      // API returns success even if event doesn't exist
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event deleted');
    });

    it('should handle invalid event ID format', async () => {
      const response = await request(app)
        .delete('/calendar/invalid-id');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle empty ID parameter', async () => {
      const response = await request(app)
        .delete('/calendar/');

      expect(response.status).toBe(404);
    });
  });
}); 