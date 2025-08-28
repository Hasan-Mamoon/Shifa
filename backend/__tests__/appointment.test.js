// At the top of the file, before imports
process.env.STRIPE_SECRET_KEY = 'sk_test_51R1H94CsJWOaW7Bds3LvYV1kd51fBxcM7gZLoGL6w7mdO3mdAPb7OzzP71UsAaxUHOyPnfY5WKhr7uCAKv6nyIkx007LujreRs';

import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { connect, clearDatabase, closeDatabase } from './setup.js';
import app from '../server.js';
import { patientModel as Patient } from '../models/patient.js';
import { doctormodel as Doctor } from '../models/doctor.js';
import { appointmentModel as Appointment } from '../models/appointment.js';
import { slotModel as Slot } from '../models/timeslots.js';
import bcrypt from 'bcryptjs';

// Mock Stripe before importing any other modules
const mockStripeRetrieve = jest.fn().mockImplementation((sessionId) => {
  return Promise.resolve({
    id: sessionId,
    payment_status: 'paid',
    status: 'complete',
    customer: 'test_customer'
  });
});

jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        retrieve: mockStripeRetrieve
      }
    }
  }));
});

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true)
  })
}));

// Mock AWS S3
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({})
  })),
  GetObjectCommand: jest.fn()
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-s3-url.com/image.jpg')
}));

describe('Appointment Routes', () => {
  beforeAll(async () => await connect());
  afterEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });
  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
  });

  let doctorId;
  let patientId;
  let patientToken;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a doctor
    const doctor = await Doctor.create({
      name: 'Dr. Test',
      email: 'doctor@example.com',
      password: await bcrypt.hash('Doctor123!', 10),
      speciality: 'Cardiology',
      experience: '10 years',
      about: 'Experienced cardiologist',
      fees: 1000,
      address: {
        line1: 'Test Hospital',
        line2: 'Test Area'
      },
      image: 'test-image.jpg',
      degree: 'test-degree.pdf'
    });
    doctorId = doctor._id;

    // Create a patient
    const patient = await Patient.create({
      name: 'Test Patient',
      email: 'patient@example.com',
      password: await bcrypt.hash('Patient123!', 10),
      phone: '1234567890',
      address: {
        line1: 'Test Address',
        line2: 'Test Area'
      },
      image: 'test-image.jpg'
    });
    patientId = patient._id;

    // Get patient token
    const loginResponse = await request(app)
      .post('/patient/login')
      .send({
        email: 'patient@example.com',
        password: 'Patient123!'
      });
    patientToken = loginResponse.body.token;
  });

  describe('POST /appointment/book-appointment', () => {
   

    it('should not book appointment without session ID', async () => {
      // Create a new slot
      const slot = await Slot.create({
        doctorId: doctorId,
        date: '2025-05-14',
        slots: [{
          time: '12:00',
          isBooked: false
        }]
      });

      const response = await request(app)
        .post('/appointment/book-appointment')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          doctorId: doctorId.toString(),
          patientId: patientId.toString(),
          slotId: slot.slots[0]._id.toString(),
          date: '2025-05-14',
          time: '12:00',
          type: 'Online',
          meetingLink: 'https://meet.test.com/123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Session ID is required.');
    });

  
  });

  describe('GET /appointment/appointments', () => {
    it('should get all appointments for a user', async () => {
      // Create a slot first
      const slot = await Slot.create({
        doctorId: doctorId,
        date: '2025-05-13',
        slots: [{
          time: '10:00',
          isBooked: true,
          patient: patientId
        }]
      });

      // Create a test appointment
      await Appointment.create({
        doctorId: doctorId,
        patientId: patientId,
        slotId: slot.slots[0]._id,
        date: '2025-05-13',
        time: '10:00',
        type: 'Online',
        status: 'Booked',
        meetingLink: 'https://meet.test.com/123'
      });

      // Wait for a moment to ensure the appointment is saved
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .get('/appointment/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ userId: patientId.toString() });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 400 if userId is not provided', async () => {
      const response = await request(app)
        .get('/appointment/appointments')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User ID is required.');
    });
  });

  describe('PATCH /appointment/:appointmentId', () => {
    it('should cancel an appointment', async () => {
      // Create a slot first
      const slot = await Slot.create({
        doctorId: doctorId,
        date: '2025-05-13',
        slots: [{
          time: '10:00',
          isBooked: false
        }]
      });

      const slotId = slot.slots[0]._id;

      // Create an appointment
      const appointment = await Appointment.create({
        doctorId,
        patientId,
        slotId,
        date: '2025-05-13',
        time: '10:00',
        type: 'Online',
        status: 'Booked',
        meetingLink: 'https://meet.test.com/123'
      });

      const response = await request(app)
        .patch(`/appointment/${appointment._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.appointment.status).toBe('Cancelled');
    });

    it('should not cancel non-existent appointment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/appointment/${fakeId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Appointment not found');
    });
  });

  describe('DELETE /appointment/:appointmentId', () => {
    it('should delete an appointment and update slot', async () => {
      // Create a slot first
      const slot = await Slot.create({
        doctorId: doctorId,
        date: '2025-05-13',
        slots: [{
          time: '10:00',
          isBooked: false
        }]
      });

      const slotId = slot.slots[0]._id;

      // Create an appointment
      const appointment = await Appointment.create({
        doctorId,
        patientId,
        slotId,
        date: '2025-05-13',
        time: '10:00',
        type: 'Online',
        status: 'Booked',
        meetingLink: 'https://meet.test.com/123'
      });

      const response = await request(app)
        .delete(`/appointment/${appointment._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Appointment cancelled successfully');
    });

    it('should not delete non-existent appointment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/appointment/${fakeId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Appointment not found');
    });
  });
});
