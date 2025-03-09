import mongoose from "mongoose";


const CalendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
});

export default mongoose.model("CalendarEvent", CalendarEventSchema);

