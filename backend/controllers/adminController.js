const PendingDoctor = require("../models/pendingDoctorModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// Fetch all pending doctor requests
const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await PendingDoctor.find({});
    res.status(200).json(pendingDoctors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Approve a doctor registration
const approveDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const pendingDoctor = await PendingDoctor.findById(id);
    if (!pendingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Hash the password and create a new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pendingDoctor.password, salt);
    const newUser = new User({
      email: pendingDoctor.email,
      password: hashedPassword,
      role: pendingDoctor.role,
      licenseNo: pendingDoctor.licenseNo,
    });
    await newUser.save();

    // Delete from pending collection
    await pendingDoctor.deleteOne();
    res.status(200).json({ message: "Doctor approved successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reject a doctor registration
const rejectDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const pendingDoctor = await PendingDoctor.findById(id);
    if (!pendingDoctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Delete the pending doctor entry
    await pendingDoctor.deleteOne();
    res.status(200).json({ message: "Doctor rejected successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getPendingDoctors, approveDoctor, rejectDoctor };
