import express from "express";
import { slotModel } from "../models/timeslots.js";

const router = express.Router();

router.post("/add", async (req, res) => {
    const { doctorId, date, slots } = req.body;
  
    try {
      const newSlots = new slotModel({
        doctorId,
        date,
        slots: slots.map(slot => ({ time: slot }))
      });
  
      await newSlots.save();
      res.status(201).json({ message: "Slots added successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error adding slots", error: err.message });
    }
  });
  

  router.post("/book", async (req, res) => {
    const { doctorId, date, time, patientEmail } = req.body;
  
    try {
      const patient = await patientModel.findOne({ email: patientEmail });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      const slotRecord = await slotModel.findOne({ doctorId, date });
      if (!slotRecord) {
        return res.status(404).json({ message: "No slots available for this doctor and date" });
      }
  
      const slot = slotRecord.slots.find(slot => slot.time === time);
      if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
      }
  
      if (slot.isBooked) {
        return res.status(400).json({ message: "Slot already booked" });
      }
  
      slot.isBooked = true;
      slot.patient = patient._id;
  
      await slotRecord.save();
      res.status(200).json({ message: "Slot booked successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error booking slot", error: err.message });
    }
  });

  router.get("/booked", async (req, res) => {
    const { doctorId, date } = req.query;
  
    try {
      const slotRecord = await slotModel
        .findOne({ doctorId, date })
        .populate("slots.patient", "name email"); // Populate patient details (name and email)
  
      if (!slotRecord) {
        return res.status(404).json({ message: "No slots found for this doctor and date" });
      }
  
      const bookedSlots = slotRecord.slots.filter(slot => slot.isBooked);
      res.status(200).json(bookedSlots);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error retrieving booked slots", error: err.message });
    }
  });

  router.post("/cancel", async (req, res) => {
    const { doctorId, date, time } = req.body;
  
    try {
      const slotRecord = await slotModel.findOne({ doctorId, date });
      if (!slotRecord) {
        return res.status(404).json({ message: "No slots found for this doctor and date" });
      }
  
      const slot = slotRecord.slots.find(slot => slot.time === time);
      if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
      }
  
      if (!slot.isBooked) {
        return res.status(400).json({ message: "Slot is not booked" });
      }
  
      slot.isBooked = false;
      slot.patient = undefined;
  
      await slotRecord.save();
      res.status(200).json({ message: "Slot booking canceled successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error canceling slot", error: err.message });
    }
  });

  export {router as slotsRouter}
  