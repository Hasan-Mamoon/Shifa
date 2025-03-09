import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { appointmentModel } from '../models/appointment.js';
import { slotModel } from '../models/timeslots.js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

const router = express.Router();

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

router.post('/book-appointment', async (req, res) => {
  const { doctorId, patientId, slotId, date, time, meetingLink } = req.body;

  console.log('Booking Appointment Request:', req.body);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const slotDocument = await slotModel
      .findOne({
        doctorId,
        date,
        slots: {
          $elemMatch: {
            _id: slotId,
            time: time,
            isBooked: false,
          },
        },
      })
      .session(session);

    if (!slotDocument) {
      throw new Error('Slot is no longer available.');
    }

    const updateResult = await slotModel.updateOne(
      { doctorId, date, 'slots._id': slotId },
      {
        $set: {
          'slots.$.isBooked': true,
          'slots.$.patient': patientId,
        },
      },
      { session }
    );

    if (updateResult.nModified === 0) {
      throw new Error('Failed to update slot status.');
    }

    const newAppointment = new appointmentModel({
      doctorId,
      patientId,
      slotId,
      date,
      time,
      status: 'Booked',
      notes: '',
      meetingLink
    });

    await newAppointment.save({ session });

    await session.commitTransaction();

    console.log('Appointment Booked:', newAppointment);

    res.status(200).json({ message: 'Appointment booked successfully.' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error during booking:', error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

router.patch('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    console.log('Cancel Appointment Request:', appointmentId);

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Appointment Cancelled:', updatedAppointment);

    res.status(200).json({
      message: 'Appointment cancelled successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling appointment', error });
  }
});

router.delete('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    console.log('Delete Appointment Request:', appointmentId);

    const deletedAppointment = await appointmentModel.findByIdAndDelete(appointmentId);

    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Appointment Deleted:', deletedAppointment);

    res.status(200).json({
      message: 'Appointment deleted successfully',
      appointment: deletedAppointment,
    });
  } catch (error) {
    console.error(error);
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
      .populate('doctorId', 'name speciality image address')
      .populate('slotId', 'time date');

    console.log(appointments);

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    for (const appointment of appointments) {
      if (appointment.doctorId.image) {
        const getObjectParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: appointment.doctorId.image,
        };
        const command = new GetObjectCommand(getObjectParams);

        appointment.doctorId.image = await getSignedUrl(s3, command, {
          expiresIn: 3600,
        });
      }
    }

    console.log('Fetched Appointments:', appointments);

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments.' });
  }
});

export { router as appointmentRouter };
