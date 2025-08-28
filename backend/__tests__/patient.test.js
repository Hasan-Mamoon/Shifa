import { jest } from '@jest/globals';
import request from 'supertest';
import { connect, clearDatabase, closeDatabase } from './setup.js';
import app from '../server.js';
import { patientModel as Patient } from '../models/patient.js';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({})
  })),
  GetObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn()
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create a valid JPEG image buffer using sharp
const createTestImage = async () => {
  return await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  })
    .jpeg()
    .toBuffer();
};

describe('Patient Routes', () => {
  jest.setTimeout(60000); // max 60s timeout

  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
  });

  const testPatient = {
    name: 'Test Patient',
    email: 'patient@example.com',
    password: 'Patient123!',
    phone: '1234567890',
    gender: 'Male',
    address: {
      line1: 'Test Address Line 1',
      line2: 'Test Address Line 2'
    },
    dob: '2000-01-01'
  };

  describe('POST /patient/add-patient', () => {
    it('should register a new patient successfully', async () => {
      const imageBuffer = await createTestImage();

      const res = await request(app)
        .post('/patient/add-patient')
        .field('name', testPatient.name)
        .field('email', testPatient.email)
        .field('password', testPatient.password)
        .field('phone', testPatient.phone)
        .field('gender', testPatient.gender)
        .field('dob', testPatient.dob)
        .field('address[line1]', testPatient.address.line1)
        .field('address[line2]', testPatient.address.line2)
        .attach('image', imageBuffer, {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Patient added successfully');
      expect(res.body.patient).toHaveProperty('email', testPatient.email);
    });

    it('should not register a patient with duplicate email', async () => {
      const hashedPassword = await bcrypt.hash(testPatient.password, 10);
      await Patient.create({
        ...testPatient,
        password: hashedPassword,
        image: 'existing.jpg'
      });

      const res = await request(app)
        .post('/patient/add-patient')
        .field('name', testPatient.name)
        .field('email', testPatient.email)
        .field('password', testPatient.password)
        .field('phone', testPatient.phone)
        .field('gender', testPatient.gender)
        .field('dob', testPatient.dob)
        .field('address[line1]', testPatient.address.line1)
        .field('address[line2]', testPatient.address.line2)
        .attach('image', await createTestImage(), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email is already registered');
    });

    it('should return error for missing required fields', async () => {
      const res = await request(app)
        .post('/patient/add-patient')
        .field('name', '')
        .field('email', '')
        .field('password', '')
        .field('phone', '')
        .attach('image', await createTestImage(), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Missing required fields');
    });
  });

  describe('POST /patient/login', () => {
    beforeEach(async () => {
      // Create a test patient using the model instance
      const patient = new Patient({
        ...testPatient,
        image: 'test-image.jpg'
      });
      await patient.save();  // This will trigger the pre-save middleware
      
      console.log('Created test patient:', {
        email: patient.email,
        hashedPassword: patient.password
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/patient/login')
        .send({
          email: testPatient.email,
          password: testPatient.password
        });

      console.log('Login response:', {
        status: res.status,
        body: res.body
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('token');
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/patient/login')
        .send({
          email: testPatient.email,
          password: 'WrongPassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Incorrect password');
    });

    it('should fail login with unregistered email', async () => {
      const res = await request(app)
        .post('/patient/login')
        .send({
          email: 'newuser@example.com',
          password: 'Patient123!'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email not registered');
    });
  });
});
