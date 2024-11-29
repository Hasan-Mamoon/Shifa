import express from "express";
import { doctormodel } from "../models/doctor.js";

const router = express.Router();

router.get("/doctors", async (req, res) => {
  try {
    const doctordata = await doctormodel.find({});
    if (!doctordata) {
      return res.status(401).json({ message: "Invalid Email" });
    }
    return res.json(doctordata); 
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export {router as doctorRouter}