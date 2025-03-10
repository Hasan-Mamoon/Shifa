import mongoose from 'mongoose';

const pendingDoctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  speciality: String,
  experience: String,
  about: String,
  fees: Number,
  address: Object,
  image: String,
  degree: String,
  status: { type: String, default: 'pending' },
});

const PendingDoctor = mongoose.model('PendingDoctor', pendingDoctorSchema);
export { PendingDoctor };
