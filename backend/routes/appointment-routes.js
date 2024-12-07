import { appointmentModel } from '../models/appointment.js';
import { slotModel } from '../models/timeslots.js';
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router() 

// router.post('/book-appointment', async (req, res) => {
//   console.log("request: ", req.body)
//   const { doctorId, patientId, slotId, date, time } = req.body;

//     // Check if the slot exists and is available
//     // const slot = await slotModel.findOne({
//     //   _id: slotId,
//     //   doctorId,
//     //   date,
//     //   "slots.time": time,
//     //   "slots.isBooked": false,
//     // });

//     // if (!slot) {
//     //   return res.status(400).json({ message: "Slot not available or already booked." });
//     // }

//     // // Book the slot
//     // await slotModel.updateOne(
//     //   { _id: slotId, "slots.time": time },
//     //   { $set: { "slots.$.isBooked": true, "slots.$.patient": patientId } }
//     // );

//     const slotDocument = await slotModel.findOne({ doctorId, date });

//     if (!slotDocument) {
//       return res.status(404).json({ message: "No slots found for the selected doctor and date." });
//     }

//     // Find the specific slot by its ID
//     const slotToBook = slotDocument.slots.id(slotId);

//     if (!slotToBook) {
//       return res.status(404).json({ message: "Slot not found." });
//     }

//     // Check if the slot is already booked
//     if (slotToBook.isBooked) {
//       return res.status(400).json({ message: "Slot is already booked." });
//     }

//     // // Update the slot's status and assign the patient
//     // slotToBook.isBooked = true;
//     // slotToBook.patient = patientId;
//     console.log('slot',slotToBook)

//     // Save the updated document
//     const session = await mongoose.startSession();

//     try {
//       session.startTransaction();
    
//       // Check if slot is still available
//       const existingSlot = await slotModel.findOne({ _id: slotId, isBooked: false }).session(session);
//       if (!existingSlot) {
//         throw new Error("Slot is no longer available.");
//       }
    
//       // Update slot status
//       existingSlot.isBooked = true;
//       const savedSlot = await existingSlot.save({ session });
//       if (!savedSlot) {
//         throw new Error("Failed to update slot status.");
//       }
    
//       // Create the appointment
//       const newAppointment = new appointmentModel({
//         doctorId,
//         patientId,
//         slotId,
//         date,
//         time,
//         status: "Booked",
//         notes:''
//       });
    
//       await newAppointment.save({ session });
    
//       // Commit the transaction
//       await session.commitTransaction();
//     } catch (error) {
//       // Rollback the transaction
//       await session.abortTransaction();
//       console.error("Error during booking:", error);
//       throw error; // or return an error response
//     } finally {
//       session.endSession();
//     }
// });

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

router.post("/tempbk",async(req,res)=>{
  const { doctorId, date, slotId, patientId } = req.body;

  try {
    // Find the document for the given doctor and date
    const slotDocument = await slotModel.findOne({ doctorId, date });

    if (!slotDocument) {
      return res.status(404).json({ message: "No slots found for the selected doctor and date." });
    }

    // Find the specific slot by its ID
    const slotToBook = slotDocument.slots.id(slotId);

    if (!slotToBook) {
      return res.status(404).json({ message: "Slot not found." });
    }

    // Check if the slot is already booked
    if (slotToBook.isBooked) {
      return res.status(400).json({ message: "Slot is already booked." });
    }

    // Update the slot's status and assign the patient
    slotToBook.isBooked = true;
    slotToBook.patient = patientId;

    // Save the updated document
    await slotDocument.save();

    const appointment = new appointmentModel

    res.status(200).json({ message: "Appointment booked successfully." });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Failed to book appointment. Please try again later." });
  }
})


export {router as appointmentRouter}
  
  
