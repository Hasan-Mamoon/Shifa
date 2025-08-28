import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import { Admin } from '../models/Admin.js';
import { doctormodel } from '../models/doctor.js';
import { patientModel } from '../models/patient.js';
import { PendingDoctor } from '../models/PendingDoctor.js';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

describe('Admin Routes', () => {
  beforeAll(async () => {
    // Create an in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Close any existing connections
    await mongoose.disconnect();
    
    // Set the test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.DEFAULT_ADMIN_EMAIL = 'admin@test.com';
    process.env.DEFAULT_ADMIN_PASSWORD = 'admin123';
    
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Clear all collections before each test
    await Admin.deleteMany({});
    await doctormodel.deleteMany({});
    await patientModel.deleteMany({});
    await PendingDoctor.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /admin/login', () => {
    it('should login with default admin credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: process.env.DEFAULT_ADMIN_EMAIL,
          password: process.env.DEFAULT_ADMIN_PASSWORD
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.role).toBe('admin');
      expect(response.body.email).toBe(process.env.DEFAULT_ADMIN_EMAIL);
    });

    it('should login with database admin credentials', async () => {
      // Create an admin in the database
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Admin.create({
        email: 'dbadmin@test.com',
        password: hashedPassword
      });

      const response = await request(app)
        .post('/admin/login')
        .send({
          email: 'dbadmin@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.role).toBe('admin');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: 'wrong@test.com',
          password: 'wrongpass'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /admin/count', () => {
    it('should return correct doctor and patient counts', async () => {
      // Create some test doctors and patients with all required fields
      await doctormodel.create([
        { 
          name: 'Doctor 1', 
          email: 'doc1@test.com', 
          password: 'pass123',
          image: 'image1.jpg',
          speciality: 'Cardiology',
          experience: '5 years',
          about: 'Experienced cardiologist',
          fees: 100,
          degree: 'MD',
          address: {
            line1: '123 Medical St',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country'
          }
        },
        { 
          name: 'Doctor 2', 
          email: 'doc2@test.com', 
          password: 'pass123',
          image: 'image2.jpg',
          speciality: 'Neurology',
          experience: '7 years',
          about: 'Experienced neurologist',
          fees: 200,
          degree: 'MD',
          address: {
            line1: '456 Medical St',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country'
          }
        }
      ]);

      await patientModel.create([
        { 
          name: 'Patient 1', 
          email: 'pat1@test.com', 
          password: 'pass123',
          phone: '1234567890',
          image: 'patient1.jpg',
          address: {
            line1: '789 Patient St',
            line2: 'Apt 1',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country'
          }
        },
        { 
          name: 'Patient 2', 
          email: 'pat2@test.com', 
          password: 'pass123',
          phone: '2345678901',
          image: 'patient2.jpg',
          address: {
            line1: '456 Patient St',
            line2: 'Apt 2',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country'
          }
        },
        { 
          name: 'Patient 3', 
          email: 'pat3@test.com', 
          password: 'pass123',
          phone: '3456789012',
          image: 'patient3.jpg',
          address: {
            line1: '123 Patient St',
            line2: 'Apt 3',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country'
          }
        }
      ]);

      const response = await request(app)
        .get('/admin/count');

      expect(response.status).toBe(200);
      expect(response.body.doctorCount).toBe(2);
      expect(response.body.patientCount).toBe(3);
    });

    it('should handle empty database', async () => {
      const response = await request(app)
        .get('/admin/count');

      expect(response.status).toBe(200);
      expect(response.body.doctorCount).toBe(0);
      expect(response.body.patientCount).toBe(0);
    });
  });

  describe('GET /admin/pending-doctors', () => {
    it('should return list of pending doctors', async () => {
      // Create some pending doctors
      const pendingDocs = await PendingDoctor.create([
        {
          name: 'Pending Doc 1',
          email: 'pending1@test.com',
          password: 'pass123',
          status: 'pending'
        },
        {
          name: 'Pending Doc 2',
          email: 'pending2@test.com',
          password: 'pass123',
          status: 'pending'
        }
      ]);

      const response = await request(app)
        .get('/admin/pending-doctors');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      // Instead of checking exact order, verify both doctors are present
      const names = response.body.map(doc => doc.name);
      expect(names).toContain('Pending Doc 1');
      expect(names).toContain('Pending Doc 2');
    });

    it('should return empty array when no pending doctors', async () => {
      const response = await request(app)
        .get('/admin/pending-doctors');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('PUT /admin/update-doctor-status/:id', () => {
    it('should approve a pending doctor', async () => {
      // Create a pending doctor with all required fields
      const pendingDoc = await PendingDoctor.create({
        name: 'Dr. Test',
        email: 'drtest@test.com',
        password: 'pass123',
        image: 'test-image.jpg',
        speciality: 'Cardiology',
        experience: '5 years',
        about: 'Experienced doctor',
        fees: 100,
        degree: 'MD',
        status: 'pending',
        address: {
          line1: '123 Medical St',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country'
        }
      });

      const response = await request(app)
        .put(`/admin/update-doctor-status/${pendingDoc._id}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Doctor approved');

      // Verify doctor was moved to approved doctors collection
      const approvedDoctor = await doctormodel.findOne({ email: 'drtest@test.com' });
      expect(approvedDoctor).toBeTruthy();
      expect(approvedDoctor.name).toBe('Dr. Test');

      // Verify doctor was removed from pending collection
      const pendingDoctor = await PendingDoctor.findById(pendingDoc._id);
      expect(pendingDoctor).toBeNull();
    });

    it('should reject a pending doctor', async () => {
      const pendingDoc = await PendingDoctor.create({
        name: 'Dr. Test',
        email: 'drtest@test.com',
        password: 'pass123',
        status: 'pending'
      });

      const response = await request(app)
        .put(`/admin/update-doctor-status/${pendingDoc._id}`)
        .send({ status: 'rejected' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Doctor rejected');

      // Verify doctor was removed from pending collection
      const pendingDoctor = await PendingDoctor.findById(pendingDoc._id);
      expect(pendingDoctor).toBeNull();

      // Verify doctor was not added to approved doctors
      const approvedDoctor = await doctormodel.findOne({ email: 'drtest@test.com' });
      expect(approvedDoctor).toBeNull();
    });

    it('should handle non-existent doctor ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/admin/update-doctor-status/${nonExistentId}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor not found');
    });
  });

  describe('POST /admin/apply-discount', () => {
    it('should apply discount to all doctors fees', async () => {
      // Create test doctors with all required fields
      await doctormodel.create([
        { 
          name: 'Doctor 1',
          email: 'doc1@test.com',
          password: 'pass123',
          image: 'image1.jpg',
          speciality: 'Cardiology',
          experience: '5 years',
          about: 'Experienced cardiologist',
          fees: 100,
          degree: 'MD',
          address: {
            line1: '123 Medical St',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country'
          }
        },
        { 
          name: 'Doctor 2',
          email: 'doc2@test.com',
          password: 'pass123',
          image: 'image2.jpg',
          speciality: 'Neurology',
          experience: '7 years',
          about: 'Experienced neurologist',
          fees: 200,
          degree: 'MD',
          address: {
            line1: '456 Medical St',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country'
          }
        }
      ]);

      const response = await request(app)
        .post('/admin/apply-discount')
        .send({ discountPercentage: 10 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Discount applied successfully');

      // Verify fees were updated
      const doctors = await doctormodel.find().sort({ fees: 1 });
      expect(doctors[0].fees).toBe(90); // 100 - 10%
      expect(doctors[1].fees).toBe(180); // 200 - 10%
    });

    it('should handle invalid discount percentage', async () => {
      const response = await request(app)
        .post('/admin/apply-discount')
        .send({ discountPercentage: -10 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid discount percentage');
    });
  });

  describe('POST /admin/remove-discount', () => {
    it('should remove discount and restore original fees', async () => {
      // Create doctors with all required fields
      await doctormodel.create([
        { 
          name: 'Doctor 1',
          email: 'doc1@test.com',
          password: 'pass123',
          image: 'image1.jpg',
          speciality: 'Cardiology',
          experience: '5 years',
          about: 'Experienced cardiologist',
          fees: 90,
          originalFees: 100,
          degree: 'MD',
          address: {
            line1: '123 Medical St',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country'
          }
        },
        {
          name: 'Doctor 2',
          email: 'doc2@test.com',
          password: 'pass123',
          image: 'image2.jpg',
          speciality: 'Neurology',
          experience: '7 years',
          about: 'Experienced neurologist',
          fees: 180,
          originalFees: 200,
          degree: 'MD',
          address: {
            line1: '456 Medical St',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country'
          }
        }
      ]);

      const response = await request(app)
        .post('/admin/remove-discount');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Discount removed successfully');

      // Verify original fees were restored
      const doctors = await doctormodel.find().sort({ fees: 1 });
      expect(doctors[0].fees).toBe(100);
      expect(doctors[0].originalFees).toBeUndefined();
      expect(doctors[1].fees).toBe(200);
      expect(doctors[1].originalFees).toBeUndefined();
    });
  });
}); 