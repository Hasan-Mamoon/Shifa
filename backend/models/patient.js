import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String },
  medicalHistory: { type: String },
  address: {
    line1: { type: String, required: true },
    line2: { type: String, required: true },
  },
  dob: { type: Date },
  password: { type: String, required: true },
});

patientSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

patientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

patientSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.dob) {
      ret.dob = ret.dob.toISOString().split("T")[0];
    }
    return ret;
  },
});

const patientModel =
  mongoose.models.Patient || mongoose.model("Patient", patientSchema);

export { patientModel };
