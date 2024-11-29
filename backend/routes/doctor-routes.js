import express from "express";
import { doctormodel } from "../models/doctor.js";

const router = express.Router();

router.get("/doctors", async (req, res) => {
  try {
    const applicantdata = await doctormodel.find({});
    if (!applicantdata) {
      return res.status(401).json({ message: "Invalid Email" });
    }
    return res.json(applicantdata); 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export {router as applicantrouter}