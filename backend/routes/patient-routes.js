import express from "express";
import { patientModel } from "../models/patient.js";

const router = express.Router();


app.post('/add-patient', async (req, res) => {
    try {
      const patient = new patientModel(req.body);
      await patient.save();
      res.status(201).json({ message: "Patient created successfully", patient });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error creating patient", error: err.message });
    }
  });

  app.get("/patients-all", async (req, res) => {
    try {
      const patients = await patientModel.find({});
      res.status(200).json(patients);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching patients", error: err.message });
    }
  });

  app.get("/patients/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const patient = await patientModel.findOne({ email });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.status(200).json(patient);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching patient", error: err.message });
    }
  });

  app.put("/update/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const updatedPatient = await patientModel.findOneAndUpdate(
        { email },
        req.body,
        { new: true, runValidators: true }
      );
  
      if (!updatedPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.status(200).json({ message: "Patient updated successfully", updatedPatient });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating patient", error: err.message });
    }
  });

  app.delete("/patients/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const deletedPatient = await patientModel.findOneAndDelete({ email });
  
      if (!deletedPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.status(200).json({ message: "Patient deleted successfully", deletedPatient });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting patient", error: err.message });
    }
  });
  
  

