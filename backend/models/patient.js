import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  medicalHistory: { type: String } // Optional field for additional details
});

const patientModel = mongoose.model("Patient", patientSchema);

export { patientModel };
