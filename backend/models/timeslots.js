import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true },
  slots: [
    {
      time: { type: String, required: true },
      isBooked: { type: Boolean, default: false },
      patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" } // Reference to Patient Schema
    }
  ]
});

const slotModel = mongoose.model("AppointmentSlots", slotSchema);

export { slotModel };
