import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { appointmentModel } from '../models/appointment.js';
import { patientModel } from '../models/patient.js';
import { doctormodel } from '../models/doctor.js';
import { slotModel } from '../models/timeslots.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


dotenv.config();

const router = express.Router();

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

router.post('/book-appointment', async (req, res) => {
  const { doctorId, patientId, slotId, date, time, type, meetingLink, sessionId } = req.body;

  console.log("Received Booking Request:", req.body);

  if (!sessionId) {
    console.error("Missing session ID");
    return res.status(400).json({ message: 'Session ID is required.' });
  }

  try {
    console.log("Verifying Stripe session:", sessionId);
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Stripe Session Data:", stripeSession);

    if (stripeSession.payment_status !== 'paid') {
      console.error("Payment NOT completed!");
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    console.log("Payment verified! Proceeding with appointment booking...");

    const session = await mongoose.startSession();
    session.startTransaction();

    const slotDocument = await slotModel
      .findOne({
        doctorId,
        date,
        slots: { $elemMatch: { _id: slotId, time, isBooked: false } },
      })
      .session(session);

    if (!slotDocument) throw new Error('Slot is no longer available.');

    const updateResult = await slotModel.updateOne(
      { doctorId, date, 'slots._id': slotId },
      { $set: { 'slots.$.isBooked': true, 'slots.$.patient': patientId } },
      { session }
    );

    if (updateResult.nModified === 0) throw new Error('Failed to update slot status.');

    const newAppointment = new appointmentModel({
      doctorId,
      patientId,
      slotId,
      date,
      time,
      type,
      status: 'Booked',
      notes: '',
      meetingLink,
    });

    await newAppointment.save({ session });
    await session.commitTransaction();
    console.log("Appointment Booked:", newAppointment);
    
    const doctor = await doctormodel.findById(doctorId);
    const patient = await patientModel.findById(patientId);

    if (doctor && patient) {
      const doctorEmail = doctor.email;
      const patientEmail = patient.email;

      // Send emails
      sendEmail(
        doctorEmail,
        'New Appointment Booked',
        `An appointment has been booked with you on ${date} at ${time}.`
      );

      sendEmail(
        patientEmail,
        'Appointment Confirmation',
        `Your appointment with Dr. ${doctor.name} is confirmed for ${date} at ${time}.`
      );
    }

    res.status(200).json({ success: true, message: 'Appointment booked successfully.' });
  } catch (error) {
    console.error('Error during booking:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    console.log('Cancel Appointment Request:', appointmentId);

    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { $set: { status: 'Cancelled' } },
      { new: true, runValidators: true }
    );

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    console.log('Appointment Cancelled:', appointment);

    if (appointment.slotId) {
      const updatedSlot = await slotModel.findOneAndUpdate(
        { 'slots._id': appointment.slotId },
        { $set: { 'slots.$.isBooked': false }, $unset: { 'slots.$.patient': '' } },
        { new: true }
      );

      if (!updatedSlot) console.warn('Slot not found for appointment:', appointmentId);
      else console.log('Slot Updated:', updatedSlot);
    }

    const doctor = await doctormodel.findById(appointment.doctorId);
    const patient = await patientModel.findById(appointment.patientId);

    if (doctor && patient) {
      const doctorEmail = doctor.email;
      const patientEmail = patient.email;


      sendEmail(
        doctorEmail,
        'Appointment Cancelled',
        `An appointment scheduled on ${appointment.date} at ${appointment.time} has been cancelled.`
      );

      sendEmail(
        patientEmail,
        'Appointment Cancellation',
        `Your appointment with Dr. ${doctor.name} on ${appointment.date} at ${appointment.time} has been cancelled.`
      );
    }

    res.status(200).json({
      message: 'Appointment cancelled successfully, slot updated',
      appointment,
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment', error });
  }
});

router.delete('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    console.log('Delete Appointment Request:', appointmentId);

    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { $set: { status: 'Cancelled' } },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.slotId) {
      const updatedSlot = await slotModel.findOneAndUpdate(
        { 'slots._id': appointment.slotId },
        {
          $set: { 'slots.$.isBooked': false },
          $unset: { 'slots.$.patient': '' }, // Remove the patient reference
        },
        { new: true }
      );

      if (!updatedSlot) {
        console.warn('Slot not found for appointment:', appointmentId);
      } else {
        console.log('Slot Updated:', updatedSlot);
      }
    }

    await appointmentModel.findByIdAndDelete(appointmentId);

    console.log('Appointment Deleted:', appointment);

    res.status(200).json({
      message: 'Appointment cancelled successfully, slot updated, and appointment deleted',
      appointment,
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
});

router.get('/appointments', async (req, res) => {
  const { userId } = req.query;

  console.log('Fetch Appointments Request:', req.query);

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const appointments = await appointmentModel
      .find({ patientId: userId })
      .populate('doctorId', 'name speciality image address');

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    await Promise.all(
      appointments.map(async (appointment) => {
        if (appointment.slotId) {
          const slotDocument = await slotModel.findOne(
            { 'slots._id': appointment.slotId },
            { 'slots.$': 1, date: 1 }
          );

          if (slotDocument && slotDocument.slots.length > 0) {
            appointment.time = slotDocument.slots[0].time;
            appointment.date = slotDocument.date;
          }
        }

        // Generate pre-signed URL for the doctor's image
        if (appointment.doctorId.image) {
          try {
            let imageKey = appointment.doctorId.image;

            // If the image field contains a URL, extract the S3 object key
            if (imageKey.startsWith('https://')) {
              const url = new URL(imageKey);
              imageKey = url.pathname.split('/').pop(); // Extract the S3 object key
            }

            const getObjectParams = {
              Bucket: process.env.BUCKET_NAME,
              Key: imageKey,
            };
            const command = new GetObjectCommand(getObjectParams);

            const preSignedUrl = await getSignedUrl(s3, command, {
              expiresIn: 3600, 
            });

            appointment.doctorId.image = preSignedUrl;
          } catch (error) {
            console.error('Error generating pre-signed URL:', error);
            
            appointment.doctorId.image = null;
          }
        }
      })
    );

    console.log('Fetched Appointments:', appointments);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments.' });
  }
});
export { router as appointmentRouter };
