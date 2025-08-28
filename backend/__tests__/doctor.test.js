import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { connect, clearDatabase, closeDatabase } from './setup.js';
import app from '../server.js';
import { doctormodel as Doctor } from '../models/doctor.js';
import { PendingDoctor } from '../models/PendingDoctor.js';
import bcrypt from 'bcryptjs';
import path from 'path';

// Mock AWS S3 Client
const mockS3Send = jest.fn().mockResolvedValue({});
const mockGetSignedUrl = jest.fn().mockResolvedValue('https://mock-s3-url.com/image.jpg');

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockS3Send
  })),
  GetObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn()
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl
}));

// Test Doctor data
const testDoctor = {
  name: 'Dr. Test',
  email: 'doctor@example.com',
  password: 'Doctor123!',
  speciality: 'Cardiology',
  experience: '10 years',
  about: 'Experienced cardiologist',
  fees: 1000,
  address: {
    line1: 'Test Hospital',
    line2: 'Test Area'
  }
};

// Create a test image buffer (minimal PNG)
const createTestImage = () => {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
};

// Create a test PDF buffer
const createTestPDF = () => {
  return Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF\n'
  );
};

describe('Doctor Routes', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await Doctor.deleteMany({});
    await PendingDoctor.deleteMany({});
  });

  describe('POST /doctor/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testDoctor.password, 10);
      await Doctor.create({
        ...testDoctor,
        password: hashedPassword,
        image: 'test-image.jpg',
        degree: 'test-degree.pdf'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/doctor/login')
        .send({
          email: testDoctor.email,
          password: testDoctor.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('email', testDoctor.email);
      expect(response.body.message).toBe('Login successful');
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/doctor/login')
        .send({
          email: testDoctor.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Incorrect password');
    });
  });

  describe('GET /doctor/get-doctor', () => {
    beforeEach(async () => {
      await Doctor.create({
        ...testDoctor,
        password: await bcrypt.hash(testDoctor.password, 10),
        image: 'test-image.jpg',
        degree: 'test-degree.pdf'
      });
    });

    it('should get doctor profile with valid email', async () => {
      const response = await request(app)
        .get('/doctor/get-doctor')
        .query({ email: testDoctor.email });

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('name', testDoctor.name);
      expect(response.body[0]).toHaveProperty('email', testDoctor.email);
    });
  });

  describe('GET /doctor/doctors-all', () => {
    beforeEach(async () => {
      await Doctor.create({
        ...testDoctor,
        password: await bcrypt.hash(testDoctor.password, 10),
        image: 'test-image.jpg',
        degree: 'test-degree.pdf'
      });
    });

    it('should get all doctors', async () => {
      const response = await request(app)
        .get('/doctor/doctors-all');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('name', testDoctor.name);
    });
  });

  describe('POST /doctor/add-doctor', () => {
    it('should successfully register a new doctor', async () => {
      const response = await request(app)
        .post('/doctor/add-doctor')
        .field('name', testDoctor.name)
        .field('email', testDoctor.email)
        .field('password', testDoctor.password)
        .field('speciality', testDoctor.speciality)
        .field('experience', testDoctor.experience)
        .field('about', testDoctor.about)
        .field('fees', testDoctor.fees)
        .field('address', JSON.stringify(testDoctor.address))
        .attach('image', createTestImage(), {
          filename: 'test-image.png',
          contentType: 'image/png'
        })
        .attach('degree', createTestPDF(), {
          filename: 'test-degree.pdf',
          contentType: 'application/pdf'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Doctor request sent for approval');
    });

    // Test for invalid address format
    it('should not register a doctor with invalid address format', async () => {
      const response = await request(app)
        .post('/doctor/add-doctor')
        .field('name', testDoctor.name)
        .field('email', testDoctor.email)
        .field('password', testDoctor.password)
        .field('speciality', testDoctor.speciality)
        .field('experience', testDoctor.experience)
        .field('about', testDoctor.about)
        .field('fees', testDoctor.fees)
        .field('address', 'invalid-json-format')
        .attach('image', createTestImage(), {
          filename: 'test-image.png',
          contentType: 'image/png'
        })
        .attach('degree', createTestPDF(), {
          filename: 'test-degree.pdf',
          contentType: 'application/pdf'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid address format');
    });

    // Test for missing files
    it('should not register a doctor without image', async () => {
      const response = await request(app)
        .post('/doctor/add-doctor')
        .field('name', testDoctor.name)
        .field('email', testDoctor.email)
        .field('password', testDoctor.password)
        .field('speciality', testDoctor.speciality)
        .field('experience', testDoctor.experience)
        .field('about', testDoctor.about)
        .field('fees', testDoctor.fees)
        .field('address', JSON.stringify(testDoctor.address))
        .attach('degree', createTestPDF(), {
          filename: 'test-degree.pdf',
          contentType: 'application/pdf'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Image and Degree files are required');
    });

    it('should not register a doctor without degree', async () => {
      const response = await request(app)
        .post('/doctor/add-doctor')
        .field('name', testDoctor.name)
        .field('email', testDoctor.email)
        .field('password', testDoctor.password)
        .field('speciality', testDoctor.speciality)
        .field('experience', testDoctor.experience)
        .field('about', testDoctor.about)
        .field('fees', testDoctor.fees)
        .field('address', JSON.stringify(testDoctor.address))
        .attach('image', createTestImage(), {
          filename: 'test-image.png',
          contentType: 'image/png'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Image and Degree files are required');
    });

    // Test for password hashing
    it('should hash the password before storing', async () => {
      await request(app)
        .post('/doctor/add-doctor')
        .field('name', testDoctor.name)
        .field('email', testDoctor.email)
        .field('password', testDoctor.password)
        .field('speciality', testDoctor.speciality)
        .field('experience', testDoctor.experience)
        .field('about', testDoctor.about)
        .field('fees', testDoctor.fees)
        .field('address', JSON.stringify(testDoctor.address))
        .attach('image', createTestImage(), {
          filename: 'test-image.png',
          contentType: 'image/png'
        })
        .attach('degree', createTestPDF(), {
          filename: 'test-degree.pdf',
          contentType: 'application/pdf'
        });

      const pendingDoctor = await PendingDoctor.findOne({ email: testDoctor.email });
      expect(pendingDoctor.password).not.toBe(testDoctor.password);
      const isPasswordMatch = await bcrypt.compare(testDoctor.password, pendingDoctor.password);
      expect(isPasswordMatch).toBe(true);
    });

    it('should not register a doctor with missing required fields', async () => {
      const incompleteDoctor = {
        // Missing most required fields
        name: '',  // Empty required field
        email: '', // Empty required field
        password: '', // Empty required field
        speciality: '', // Empty required field
        experience: '', // Empty required field
        about: '', // Empty required field
        fees: '', // Empty required field
        address: JSON.stringify({
          line1: '', // Empty required field
          line2: ''
        })
      };

      const response = await request(app)
        .post('/doctor/add-doctor')
        .field('name', incompleteDoctor.name)
        .field('email', incompleteDoctor.email)
        .field('password', incompleteDoctor.password)
        .field('speciality', incompleteDoctor.speciality)
        .field('experience', incompleteDoctor.experience)
        .field('about', incompleteDoctor.about)
        .field('fees', incompleteDoctor.fees)
        .field('address', incompleteDoctor.address)
        .attach('image', createTestImage(), {
          filename: 'test-image.png',
          contentType: 'image/png'
        })
        .attach('degree', createTestPDF(), {
          filename: 'test-degree.pdf',
          contentType: 'application/pdf'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Missing required fields');
    });
  });
});
