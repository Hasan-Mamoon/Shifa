import { appointmentModel } from '../models/appointment.js';
import express from 'express';

const router = express.Router() 

router.post('/book-appointment', async (req, res) => {
  try {
    const { doctorId, patientId, slotId, date, time, notes } = req.body;

    const newAppointment = new appointmentModel({
      doctorId,
      patientId,
      slotId,
      date,
      time,
      notes,
    });

    const savedAppointment = await newAppointment.save();
    return res.status(201).json({ message: "Appointment booked successfully", appointment: savedAppointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error booking appointment", error });
  }
});

router.get('/:email', async (req, res) => {
    try {
      const { email } = req.params;
  
      const appointments = await appointmentModel.find({ email})
        .populate("patientId", "name email") // Populate patient details
        .populate("slotId", "time date")    // Populate slot details
        .exec();
  
      if (!appointments.length) {
        return res.status(404).json({ message: "No appointments found for this doctor" });
      }
  
      return res.status(200).json(appointments);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error retrieving appointments", error });
    }
  });

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


export {router as appointmentRouter}
  
  
