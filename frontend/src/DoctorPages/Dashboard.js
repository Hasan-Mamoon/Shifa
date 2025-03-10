import React, { useEffect, useState } from 'react';
import Layout from '../DoctorComponents/Layout';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaUserMd } from "react-icons/fa";

const Dashboard = () => {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [stats, setStats] = useState({ totalAppointments: 0, availableSlots: 0 });
  const { user } = useAuth();
  const doctorId = user?.id;

  const [message, setMessage] = useState('');

  const apiCall = async (url, method, data = {}) => {
    try {
      const response = await axios({
        url,
        method,
        data: method === 'post' ? data : {},
        params: method === 'get' ? data : {},
      });
      return response.data;
    } catch (error) {
      console.error(`Error with ${method.toUpperCase()} ${url}:`, error);
      throw error;
    }
  };

  const fetchSlots = async () => {
    if (!date || !doctorId) {
      setSlots([]);
      setStats({ totalAppointments: 0, availableSlots: 0 }); // Reset stats
      return;
    }
    try {
      const data = await apiCall(`${process.env.REACT_APP_SERVER_URL}/slot/appointments`, 'get', {
        doctorId,
        date,
      });
  
      if (data.length === 0) {
        setSlots([]);
        setStats({ totalAppointments: 0, availableSlots: 0 }); // Set stats to zero when no slots exist
        setMessage('No slots available for this date');
        return;
      }
  
      const bookedSlots = data.filter((slot) => slot.isBooked).length;
      const availableSlots = data.filter((slot) => !slot.isBooked).length;
  
      setSlots(data);
      setStats({
        totalAppointments: bookedSlots,
        availableSlots: availableSlots,
      });
    } catch (error) {
      setMessage('No slots available for this date');
      setSlots([]);
      setStats({ totalAppointments: 0, availableSlots: 0 }); // Reset stats on error
    }
  };
  
  

  const fetchStats = async () => {
    if (!doctorId) return;
    try {
      const data = await apiCall(`${process.env.REACT_APP_SERVER_URL}/stats`, 'get', { doctorId });
      setStats(data);
    } catch (error) {
      setMessage('Error fetching stats');
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot) {
      setMessage('Please enter a valid time for the new slot.');
      return;
    }
    if (slots.some((slot) => slot.time === newSlot)) {
      setMessage('This slot is already added.');
      return;
    }
    try {
      await apiCall(`${process.env.REACT_APP_SERVER_URL}/slot/add`, 'post', {
        doctorId,
        date,
        slots: [...slots.map((slot) => slot.time), newSlot],
      });
      setMessage('New slot added successfully!');
      setNewSlot('');
      fetchSlots();
    } catch (error) {
      setMessage('Error adding new slot. Please try again.');
    }
  };

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  useEffect(() => {
    if (doctorId) {
      fetchStats();
    }
  }, [doctorId]);

  useEffect(() => {
    fetchSlots();
  }, [date]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-10 bg-gray-100 shadow-2xl rounded-xl">
        <h1 className="text-5xl font-bold text-gray-800 mb-8 text-center">Doctor Dashboard</h1>
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800">
            Welcome, Dr
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Manage your appointments and schedule with ease.
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-blue-100 p-6 rounded-lg flex items-center shadow-md">
            <FaUserMd className="text-3xl text-blue-500 mr-4" />
            <div>
              <p className="text-xl font-semibold">Total Appointments Booked</p>
              <p className="text-3xl text-blue-700">{stats.totalAppointments}</p>
            </div>
          </div>
          <div className="bg-green-100 p-6 rounded-lg flex items-center shadow-md">
            <FaCheckCircle className="text-3xl text-green-500 mr-4" />
            <div>
              <p className="text-xl font-semibold">Available Slots</p>
              <p className="text-3xl text-green-700">{stats.availableSlots}</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <label htmlFor="date" className="block text-lg font-semibold text-gray-700">
            Select Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Available Slots</h2>
          {slots.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slots.map((slot, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
                    slot.isBooked
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  <span className="text-lg">{slot.time}</span>
                  <span className="text-sm">{slot.isBooked ? 'Booked' : 'Available'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No slots available for the selected date.</p>
          )}
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Add New Slot</h2>
          <form onSubmit={handleAddSlot} className="flex flex-wrap gap-4">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
            >
              Add Slot
            </button>
          </form>
        </div>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-center shadow-lg ${
              message.includes('success')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;




// import React, { useEffect, useState } from "react";
// import Layout from "../DoctorComponents/Layout";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import { FaCalendarAlt, FaClock, FaCheckCircle, FaUserMd } from "react-icons/fa";

// const Dashboard = () => {
//   const [slots, setSlots] = useState([]);
//   const [date, setDate] = useState("");
//   const [newSlot, setNewSlot] = useState("");
//   const { user } = useAuth();
//   const doctorId = user?.id;

//   const [message, setMessage] = useState("");
//   const [stats, setStats] = useState({
//     totalAppointments: 0,
//     availableSlots: 0,
//   });

//   useEffect(() => {
//     fetchSlots();
//   }, [date]);

//   const fetchSlots = async () => {
//     if (!date) {
//       setSlots([]);
//       return;
//     }
//     try {
//       const data = await axios.get(
//         `${process.env.REACT_APP_SERVER_URL}/slot/appointments`,
//         {
//           params: { doctorId, date },
//         }
//       );
//       setSlots(data.length > 0 ? data : []);
//       setStats({
//         totalAppointments: data.length,
//         availableSlots: data.filter((slot) => !slot.isBooked).length,
//       });
//     } catch (error) {
//       setMessage("No slots available for this date");
//       setSlots([]);
//     }
//   };

//   const handleAddSlot = async (e) => {
//     e.preventDefault();
//     if (!newSlot) {
//       setMessage("Please enter a valid time for the new slot.");
//       return;
//     }
//     if (slots.some((slot) => slot.time === newSlot)) {
//       setMessage("This slot is already added.");
//       return;
//     }
//     try {
//       await axios.post(`${process.env.REACT_APP_SERVER_URL}/slot/add`, {
//         doctorId,
//         date,
//         slots: [...slots.map((slot) => slot.time), newSlot],
//       });
//       setMessage("New slot added successfully!");
//       setNewSlot("");
//       fetchSlots();
//     } catch (error) {
//       setMessage("Error adding new slot. Please try again.");
//     }
//   };

//   return (
//     <Layout>
//       <div className="max-w-5xl mx-auto p-10 bg-white shadow-2xl rounded-xl">
//         {/* Welcome Section */}
//         <div className="text-center mb-10">
//           <h1 className="text-5xl font-bold text-gray-800">
//             Welcome, Dr. {user?.name || "Doctor"}!
//           </h1>
//           <p className="text-gray-600 text-lg mt-2">
//             Manage your appointments and schedule with ease.
//           </p>
//         </div>

//         {/* Dashboard Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
//           <div className="bg-blue-100 p-6 rounded-lg flex items-center shadow-md">
//             <FaUserMd className="text-3xl text-blue-500 mr-4" />
//             <div>
//               <p className="text-xl font-semibold">Total Appointments</p>
//               <p className="text-3xl text-blue-700">{stats.totalAppointments}</p>
//             </div>
//           </div>
//           <div className="bg-green-100 p-6 rounded-lg flex items-center shadow-md">
//             <FaCheckCircle className="text-3xl text-green-500 mr-4" />
//             <div>
//               <p className="text-xl font-semibold">Available Slots</p>
//               <p className="text-3xl text-green-700">{stats.availableSlots}</p>
//             </div>
//           </div>
//         </div>

//         {/* Date Selection */}
//         <div className="mb-10">
//           <label htmlFor="date" className="block text-lg font-semibold text-gray-700">
//             Select Date
//           </label>
//           <input
//             id="date"
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className="w-full p-4 border border-gray-300 rounded-lg mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Available Slots */}
//         <div className="mb-10">
//           <h2 className="text-3xl font-semibold text-gray-700 mb-4">
//             Available Slots
//           </h2>
//           {slots.length > 0 ? (
//             <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {slots.map((slot, index) => (
//                 <li
//                   key={index}
//                   className={`flex justify-between items-center p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
//                     slot.isBooked
//                       ? "bg-red-50 text-red-700 border border-red-200"
//                       : "bg-green-50 text-green-700 border border-green-200"
//                   }`}
//                 >
//                   <FaClock className="text-xl mr-2" />
//                   <span className="text-lg">{slot.time}</span>
//                   <span className="text-sm">
//                     {slot.isBooked ? "Booked" : "Available"}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-500 italic">
//               No slots available for the selected date.
//             </p>
//           )}
//         </div>

//         {/* Add New Slot */}
//         <div className="mb-10">
//           <h2 className="text-3xl font-semibold text-gray-700 mb-4">
//             Add New Slot
//           </h2>
//           <form onSubmit={handleAddSlot} className="flex flex-wrap gap-4">
//             <input
//               type="time"
//               value={newSlot}
//               onChange={(e) => setNewSlot(e.target.value)}
//               className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//             <button
//               type="submit"
//               className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
//             >
//               Add Slot
//             </button>
//           </form>
//         </div>

//         {/* Message Box */}
//         {message && (
//           <div
//             className={`mt-6 p-4 rounded-lg text-center shadow-lg ${
//               message.includes("success")
//                 ? "bg-green-100 text-green-700"
//                 : "bg-red-100 text-red-700"
//             }`}
//           >
//             {message}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default Dashboard;
