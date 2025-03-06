import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  about: { type: String, required: true },
  fees: { type: Number, required: true },
  address: {
    line1: { type: String, required: true },
    line2: { type: String, required: true },
    line2: { type: String, required: true },
  },
});

const doctorModel = mongoose.model("Doctor", doctorSchema);

export { doctorModel as doctormodel };



