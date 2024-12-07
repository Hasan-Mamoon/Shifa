// import React, { useState, useEffect, useContext } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { AppContext } from "../context/AppContext";

// const Appointment = () => {
//   const { docId } = useParams(); // Get the doctor ID from the URL
//   const { doctors, currencySymbol } = useContext(AppContext); // Get doctors data and currency
//   const [docInfo, setDocInfo] = useState(null); // Store doctor info
//   const [availableDates, setAvailableDates] = useState([]); // Store available dates
//   const [appointments, setAppointments] = useState([]); // Store appointments for selected date
//   const [selectedDate, setSelectedDate] = useState(null); // Store the selected date

//   // Fetch doctor info from the context or API
//   useEffect(() => {
//     const fetchDoctorInfo = async () => {
//       const doc = doctors.find((doc) => doc._id === docId);
//       setDocInfo(doc);
//     };

//     fetchDoctorInfo();
//   }, [docId, doctors]);

//   // Fetch all available dates for the doctor
//   useEffect(() => {
//     const fetchAvailableDates = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:3080/slot/dates?doctorId=${docId}`
//         );
//         console.log("Available Dates:", response.data); // Log the data to verify
//         setAvailableDates(response.data);
//       } catch (error) {
//         console.error("Error fetching available dates:", error);
//       }
//     };

//     if (docId) {
//       fetchAvailableDates();
//     }
//   }, [docId]);

//   // Handle date click to fetch available slots for that date
//   const handleDateClick = async (date) => {
//     setSelectedDate(date); // Set selected date

//     try {
//       const response = await axios.get(
//         `http://localhost:3080/slot/appointments?doctorId=${docId}&date=${date}`
//       );
//       console.log("Available Slots for Date:", response.data); // Log the data to verify
//       setAppointments(response.data);
//     } catch (error) {
//       console.error("Error fetching appointments:", error);
//     }
//   };

//   return (
//     <div>
//       {docInfo && (
//         <div>
//           <div className="doctor-info">
//             <img src={docInfo.image} alt={docInfo.name} />
//             <h2>{docInfo.name}</h2>
//             <p>{docInfo.degree} - {docInfo.speciality}</p>
//             <p>{docInfo.about}</p>
//             <p>Appointment fee: {currencySymbol} {docInfo.fees}</p>
//           </div>

//           {/* Available Dates Section */}
//           <div className="available-dates">
//             <h3>Available Dates</h3>
//             <div className="dates-list">
//               {availableDates.map((date) => (
//                 <button
//                   key={date}
//                   onClick={() => handleDateClick(date)}
//                   className="date-button"
//                 >
//                   {new Date(date).toLocaleDateString()}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Appointments for the selected date */}
//           {selectedDate && (
//             <div className="appointments-list">
//               <h3>Appointments for {new Date(selectedDate).toLocaleDateString()}</h3>
//               <div className="appointments">
//                 {appointments.length > 0 ? (
//                   appointments.map((slot) => (
//                     <div key={slot._id} className="appointment">
//                       <p>Time: {slot.time}</p>
//                       <p>Status: {slot.isBooked ? "Booked" : "Available"}</p>
//                     </div>
//                   ))
//                 ) : (
//                   <p>No appointments available for this date.</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Appointment;
import express from "express";
import { slotModel } from "../models/timeslots.js";

const router = express.Router();

router.post("/add", async (req, res) => {
    const { doctorId, date, slots } = req.body;
  
    try {
      const newSlots = new slotModel({
        doctorId,
        date,
        slots: slots.map(slot => ({ time: slot }))
      });
  
      await newSlots.save();
      res.status(201).json({ message: "Slots added successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error adding slots", error: err.message });
    }
  });
  

  router.post("/book", async (req, res) => {
    const { doctorId, date, time, patientEmail } = req.body;
  
    try {
      const patient = await patientModel.findOne({ email: patientEmail });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      const slotRecord = await slotModel.findOne({ doctorId, date });
      if (!slotRecord) {
        return res.status(404).json({ message: "No slots available for this doctor and date" });
      }
  
      const slot = slotRecord.slots.find(slot => slot.time === time);
      if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
      }
  
      if (slot.isBooked) {
        return res.status(400).json({ message: "Slot already booked" });
      }
  
      slot.isBooked = true;
      slot.patient = patient._id;
  
      await slotRecord.save();
      res.status(200).json({ message: "Slot booked successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error booking slot", error: err.message });
    }
  });

  router.get("/booked", async (req, res) => {
    const { doctorId, date } = req.query;
  
    try {
      const slotRecord = await slotModel
        .findOne({ doctorId, date })
        .populate("slots.patient", "name email"); // Populate patient details (name and email)
  
      if (!slotRecord) {
        return res.status(404).json({ message: "No slots found for this doctor and date" });
      }
  
      const bookedSlots = slotRecord.slots.filter(slot => slot.isBooked);
      res.status(200).json(bookedSlots);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error retrieving booked slots", error: err.message });
    }
  });

  router.post("/cancel", async (req, res) => {
    const { doctorId, date, time } = req.body;
  
    try {
      const slotRecord = await slotModel.findOne({ doctorId, date });
      if (!slotRecord) {
        return res.status(404).json({ message: "No slots found for this doctor and date" });
      }
  
      const slot = slotRecord.slots.find(slot => slot.time === time);
      if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
      }
  
      if (!slot.isBooked) {
        return res.status(400).json({ message: "Slot is not booked" });
      }
  
      slot.isBooked = false;
      slot.patient = undefined;
  
      await slotRecord.save();
      res.status(200).json({ message: "Slot booking canceled successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error canceling slot", error: err.message });
    }
  });

  router.get("/dates", async (req, res) => {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required." });
    }
  
    try {
      const dates = await slotModel
        .find({ doctorId })
        .distinct("date");
  
      return res.status(200).json(dates);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching dates.", error });
    }

  });

  router.get("/appointments", async(req,res)=>{
    const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ message: "Doctor ID and date are required." });
  }

  try {
    const slots = await slotModel.findOne({ doctorId, date }, { slots: 1 });

    if (!slots) {
      return res.status(404).json({ message: "No slots found for the given date." });
    }

    return res.status(200).json(slots.slots);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching slots.", error });
  }
  });

  router.get("/slotsbyid",async(req,res)=>{
    const { doctorId, date } = req.query;

  try {
    // Fetch the slot document for the given doctor and date
    const slotData = await slotModel.findOne({ doctorId, date }).populate('slots.patient', 'name');

    if (!slotData) {
      return res.status(404).json({ message: "No slots found for the selected doctor and date." });
    }

    // Include the _id for each slot
    const slotsWithIds = slotData.slots.map((slot) => ({
      slotId: slot._id, // Include MongoDB's _id
      time: slot.time,
      isBooked: slot.isBooked,
      patient: slot.patient ? { id: slot.patient._id, name: slot.patient.name } : null,
    }));

    res.status(200).json(slotsWithIds);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ message: "Failed to fetch slots. Please try again later." });
  }
  }
);

  export {router as slotsRouter}
  