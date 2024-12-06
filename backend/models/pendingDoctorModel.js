const mongoose = require("mongoose");

const pendingDoctorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["doctor"],
    required: true,
  },
  licenseNo: {
    type: String,
    required: true,
    unique: true,
  },
  licensePicture: {
    type: String, // AWS S3 file URL
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PendingDoctor", pendingDoctorSchema);
