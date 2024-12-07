import { appointmentModel } from '../models/appointment.js';
import { slotModel } from '../models/timeslots.js';
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router() 

router.post('/book-appointment', async (req, res) => {
  console.log("request: ", req.body);
  const { doctorId, patientId, slotId, date, time } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check if the slot exists and is available
    const slotDocument = await slotModel.findOne({
      doctorId,
      date,
      slots: {
        $elemMatch: {
          _id: slotId,
          time: time,
          isBooked: false,
        },
      },
    }).session(session);

    if (!slotDocument) {
      throw new Error("Slot is no longer available.");
    }

    // Update the specific slot's status and assign the patient
    const updateResult = await slotModel.updateOne(
      {
        doctorId,
        date,
        "slots._id": slotId,
      },
      {
        $set: {
          "slots.$.isBooked": true,
          "slots.$.patient": patientId,
        },
      },
      { session }
    );

    if (updateResult.nModified === 0) {
      throw new Error("Failed to update slot status.");
    }

    // Create the appointment
    const newAppointment = new appointmentModel({
      doctorId,
      patientId,
      slotId,
      date,
      time,
      status: "Booked",
      notes: '',
    });

    await newAppointment.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    res.status(200).json({ message: "Appointment booked successfully." });
  } catch (error) {
    // Rollback the transaction
    await session.abortTransaction();
    console.error("Error during booking:", error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});


// router.get('/:email', async (req, res) => {
//     try {
//       const { email } = req.params;
  
//       const appointments = await appointmentModel.find({ email})
//         .populate("patientId", "name email") // Populate patient details
//         .populate("slotId", "time date")    // Populate slot details
//         .exec();
  
//       if (!appointments.length) {
//         return res.status(404).json({ message: "No appointments found for this doctor" });
//       }
  
//       return res.status(200).json(appointments);
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: "Error retrieving appointments", error });
//     }
//   });

  router.patch("/:appointmentId", async (req, res) => {
    try {
      const { appointmentId } = req.params;
  
      const updatedAppointment = await appointmentModel.findByIdAndUpdate(
        appointmentId,
        { status: "Cancelled" },
        { new: true }
      );
  
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
  
      return res.status(200).json({ 
        message: "Appointment cancelled successfully", 
        appointment: updatedAppointment 
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error cancelling appointment", error });
    }
  });

router.delete("/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const deletedAppointment = await appointmentModel.findByIdAndDelete(appointmentId);

    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json({ 
      message: "Appointment deleted successfully", 
      appointment: deletedAppointment 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting appointment", error });
  }
});

router.get("/appointments", async (req, res) => {
  const { userId } = req.query;
  console.log("uid: ", userId)

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const appointments = await appointmentModel
      .find({ patientId: userId })
      .populate("doctorId", "name speciality image address")
      .populate("slotId", "time date");

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments." });
  }
});


export {router as appointmentRouter}
  
  
