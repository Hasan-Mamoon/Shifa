// import React, { useContext, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { AppContext } from "../context/AppContext";
// import { assets } from "../assets/assets";
// import RelatedDoctors from "../PatientComponents/RelatedDoctors";

// const Appointment = () => {
//   const { docId } = useParams();
//   const { doctors, currencySymbol } = useContext(AppContext);
//   const [docInfo, setDocInfo] = useState(null);
//   const [slotId, setSlotId] = useState(""); // New state for slot ID
//   const [availableDates, setAvailableDates] = useState([]); // Store available dates
//   const [docSlots, setDocSlots] = useState([]); // Store slots for the selected date
//   const [slotIndex, setSlotIndex] = useState(0);
//   const [slotTime, setSlotTime] = useState("");

//   // Fetch doctor info
//   const fetchDocInfo = async () => {
//     const docInfo = doctors.find((doc) => doc._id === docId);
//     setDocInfo(docInfo);
//     console.log(docInfo);
//   };


//   // Fetch available dates for the doctor
//   const getAvailableDates = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:3080/slot/dates?doctorId=${docId}`
//       );
//       const datesFromDB = await response.json();
//       if (!response.ok) {
//         console.error("Error:", datesFromDB.message);
//         return;
//       }
//       setAvailableDates(datesFromDB); // Set available dates
//     } catch (error) {
//       console.error("Error fetching available dates:", error);
//     }
//   };

//   // Fetch slots for the selected date
//   // const getAvailableSlots = async (date) => {
//   //   try {
//   //     const response = await fetch(
//   //       `http://localhost:3080/slot/appointments?doctorId=${docId}&date=${date}`
//   //     );
//   //     const slotsFromDB = await response.json();
  
//   //     if (!response.ok) {
//   //       console.error("Error:", slotsFromDB.message);
//   //       return;
//   //     }
  
//   //     const groupedSlots = [];
//   //     slotsFromDB.forEach((slot) => {
//   //       groupedSlots.push({
//   //         time: slot.time,
//   //         isBooked: slot.isBooked,
//   //       });
//   //     });
  
//   //     setDocSlots(groupedSlots); // Set slots for selected date
//   //   } catch (error) {
//   //     console.error("Error fetching slots:", error);
//   //   }
//   // };
//   const getAvailableSlots = async (date) => {
//     try {
//       const response = await fetch(
//         `http://localhost:3080/slot/appointments?doctorId=${docId}&date=${date}`
//       );
//       const slotsFromDB = await response.json();
  
//       if (!response.ok) {
//         console.error("Error:", slotsFromDB.message);
//         return;
//       }
  
//       const groupedSlots = slotsFromDB.map((slot) => ({
//         slotId: slot.slotId, // Store slot ID
//         time: slot.time,
//         isBooked: slot.isBooked,
//       }));
  
//       setDocSlots(groupedSlots);
//     } catch (error) {
//       console.error("Error fetching slots:", error);
//     }
//   };



  

//   // Effect to fetch doctor information
//   useEffect(() => {
//     fetchDocInfo();
//   }, [doctors, docId]);

//   // Effect to fetch available dates when the doctor changes
//   useEffect(() => {
//     if (docInfo) {
//       getAvailableDates();
//     }
//   }, [docInfo]);

//   // Effect to update slots when a date is selected
//   useEffect(() => {
//     if (availableDates.length) {
//       getAvailableSlots(availableDates[0]); // Load the first date's slots initially
//     }
//   }, [availableDates]);

//   return (
//     docInfo && (
//       <div>
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div>
//             <img
//               className="bg-primary w-full sm:max-w-72 rounded-lg"
//               src={docInfo.image}
//               alt=""
//             />
//           </div>
//           <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
//             <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
//               {docInfo.name}
//               <img className="w-5" src={assets.verified_icon} alt="" />
//             </p>

//             <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
//               <p>
//                 {docInfo.degree} - {docInfo.speciality}
//               </p>
//               <button className="py-0.5 px-2 border text-xs rounded-full">
//                 {docInfo.experience}
//               </button>
//             </div>

//             <div>
//               <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
//                 About <img src={assets.info_icon} alt="" />
//               </p>
//               <p className="text-sm text-gray-500 max-w-[700px] mt-1">
//                 {docInfo.about}
//               </p>
//             </div>

//             <p className="text-gray-500 font-medium mt-4">
//               Appointment fee:{" "}
//               <span className="text-gray-600">
//                 {currencySymbol} {docInfo.fees}
//               </span>
//             </p>
//           </div>
//         </div>

//         <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
//           <p>Booking Slots</p>
//           {/* Horizontal Scroll for Dates */}
//           <div className="flex gap-3 items-center w-full overflow-x-auto mt-4">
//             {availableDates.length &&
//               availableDates.map((date, index) => (
//                 <div
//                   onClick={() => {
//                     setSlotIndex(index);
//                     getAvailableSlots(date);
//                   }}
//                   className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
//                     slotIndex === index
//                       ? "bg-primary text-white"
//                       : "border border-gray-200"
//                   }`}
//                   key={index}
//                 >
//                   <p>{new Date(date).toLocaleDateString()}</p>
//                 </div>
//               ))}
//           </div>

//           {/* Horizontal Scroll for Times */}
//           <div className="flex items-center gap-3 w-full overflow-x-auto mt-4">
//             {docSlots.length &&
//               docSlots.map((item, index) => (
//                 <p
//                   // onClick={() => setSlotTime(item.time);setSlotId(item.slotId)}
//                   onClick={() => {
//                     setSlotTime(item.time); // Store the time
//                     setSlotId(item.slotId); // Store the slot ID
//                   }}
//                   className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
//                     item.time === slotTime
//                       ? "bg-primary text-white"
//                       : "text-gray-400 border border-gray-300"
//                   }`}
//                   key={index}
//                 >
//                   {item.time.toLowerCase()}
//                 </p>
//               ))}
//           </div>

//           <button className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6">
//             Book an appointment
//           </button>
//         </div>

//         <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
//       </div>
//     )
//   );
// };

// export default Appointment;

import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
const MyAppointments = () => {
  const { doctors } = useContext(AppContext);
  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      <div>
        {doctors.slice(0, 3).map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img className="w-32 bg-indigo-50" src={item.image} alt="" />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutal-800 font-semibold">{item.name}</p>
              <p>{item.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.address.line1}</p>
              <p className="text-xs">{item.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-netural-700 font-medium">
                  Date & Time:
                </span>
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end">
              <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                Pay Online
              </button>
              <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">
                Cancel appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
