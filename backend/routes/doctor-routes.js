import express from "express";
import { doctormodel } from "../models/doctor.js";

const router = express.Router();

router.post("/add-doctor", async (req, res) => {
  try {
    const {
      name,
      image,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    const newDoctor = new doctormodel({
      email,
      name,
      image,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    });

    const savedDoctor = await newDoctor.save();

    return res
      .status(201)
      .json({ message: "Doctor added successfully", doctor: savedDoctor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error adding doctor", error: err });
  }
});

router.get("/doctors-all", async (req, res) => {
  try {
    const doctordata = await doctormodel.find({});

    if (!doctordata) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json(doctordata);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/update/:email", async (req, res) => {
  try {
    const { email } = req.params; // Get the email from route parameters
    const {
      name,
      image,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    const updatedData = {
      name,
      image,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    };

    // Remove undefined or null fields to prevent updating with empty values
    // Object.keys(updatedData).forEach((key) => {
    //   if (updatedData[key] === undefined || updatedData[key] === null) {
    //     delete updatedData[key];
    //   }
    // });

    const updatedDoctor = await doctormodel.findOneAndUpdate(
      { email }, // Search for the doctor by email
      updatedData, // Fields to update
      { new: true } // Return the updated document
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res
      .status(200)
      .json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error updating doctor", error: err.message });
  }
});

router.delete("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const deletedDoctor = await doctormodel.findOneAndDelete({ email });

    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json({ message: "Doctor deleted successfully", doctor: deletedDoctor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting doctor", error: err.message });
  }
});

export { router as doctorRouter };
