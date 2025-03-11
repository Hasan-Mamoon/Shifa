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
  const { doctorId, patientId, slotId, date, time, type, meetingLink } = req.body;

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
      type,
      status: 'Booked',
      notes: '',
      meetingLink,
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

// router.patch('/:appointmentId', async (req, res) => {
//   try {
//     const { appointmentId } = req.params;

//     console.log('Cancel Appointment Request:', appointmentId);

//     const updatedAppointment = await appointmentModel.findByIdAndUpdate(
//       appointmentId,
//       { status: 'Cancelled' },
//       { new: true }
//     );

//     if (!updatedAppointment) {
//       return res.status(404).json({ message: 'Appointment not found' });
//     }

//     console.log('Appointment Cancelled:', updatedAppointment);

//     res.status(200).json({
//       message: 'Appointment cancelled successfully',
//       appointment: updatedAppointment,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error cancelling appointment', error });
//   }
// });

router.patch('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    console.log('Cancel Appointment Request:', appointmentId);

    // Step 1: Find the appointment to get the slotId
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { $set: { status: 'Cancelled' } },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Step 2: Update the appointment status to "Cancelled"

    console.log('Appointment Cancelled:', appointment);

    // Step 3: If the appointment has a slotId, update the specific slot in the slot array
    if (appointment.slotId) {
      const updatedSlot = await slotModel.findOneAndUpdate(
        { 'slots._id': appointment.slotId }, // Find the slot containing the slotId
        {
          $set: { 'slots.$.isBooked': false }, // Set isBooked to false
          $unset: { 'slots.$.patient': '' }, // Remove patient field from that slot
        },
        { new: true }
      );

      if (!updatedSlot) {
        console.warn('Slot not found for appointment:', appointmentId);
      } else {
        console.log('Slot Updated:', updatedSlot);
      }
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

    // Step 1: Find the appointment and update its status to 'Cancelled'
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { $set: { status: 'Cancelled' } },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Step 2: Update the corresponding slot's 'isBooked' status to false
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

    // Step 3: Delete the appointment
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
    // Step 1: Fetch appointments for the user
    const appointments = await appointmentModel
      .find({ patientId: userId })
      .populate('doctorId', 'name speciality image address');

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    // Step 2: Process each appointment
    await Promise.all(
      appointments.map(async (appointment) => {
        // Add time and date from the slot
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

            // Generate a pre-signed URL using the S3 object key
            const getObjectParams = {
              Bucket: process.env.BUCKET_NAME,
              Key: imageKey,
            };
            const command = new GetObjectCommand(getObjectParams);

            const preSignedUrl = await getSignedUrl(s3, command, {
              expiresIn: 3600, // URL expires in 1 hour
            });

            // Assign the pre-signed URL to the doctor's image field
            appointment.doctorId.image = preSignedUrl;
          } catch (error) {
            console.error('Error generating pre-signed URL:', error);
            // If there's an error, set the image to null or a placeholder
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
