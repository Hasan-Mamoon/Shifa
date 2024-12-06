import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  age: { type: Number }, // Existing field
  gender: { type: String }, // Existing field
  medicalHistory: { type: String }, // Existing field
  address: { // New field added
    line1: { type: String, required: true },
    line2: { type: String, required: true },
  },
  dob: { type: Date }, // New field added
});

// Custom toJSON transformation to format the `dob` field
patientSchema.set("toJSON", {
  transform: (doc, ret) => {
    // Format the date field
    if (ret.dob) {
      ret.dob = ret.dob.toISOString().split("T")[0]; // Converts to 'YYYY-MM-DD'
    }
    return ret;
  },
});

// Ensure model is not overwritten when imported multiple times
const patientModel = mongoose.models.Patient || mongoose.model("Patient", patientSchema);

export { patientModel };
