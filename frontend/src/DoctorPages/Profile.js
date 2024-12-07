// import React, { useState } from "react";
// import { FaEdit, FaSave } from "react-icons/fa";
// import doctorImage from "../assets/doc1.png"; // Update with the path to your doctor's image
// import Layout from "../DoctorComponents/Layout";

// const Profile = () => {
//   // Sample doctor data
//   const initialDoctorData = {
//     name: "Dr. Richard James",
//     qualifications: "MBBS - General Physician",
//     yearsOfExperience: 4,
//     about:
//       "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
//     appointmentFee: 50,
//     address: "24 main street, 10 clause road",
//     available: true,
//   };

//   // State to manage edit mode and doctor data
//   const [doctorData, setDoctorData] = useState(initialDoctorData);
//   const [isEditing, setIsEditing] = useState(false);

//   // Function to handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setDoctorData((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   // Function to toggle edit/save mode
//   const toggleEditMode = () => {
//     setIsEditing((prevState) => !prevState);
//   };

//   // Save changes (can be further expanded to send data to backend)
//   const handleSave = () => {
//     toggleEditMode();
//     // In a real app, you can also add code to save the changes to the backend
//     console.log("Saved doctor data:", doctorData);
//   };

//   return (
//     <Layout>
//       <div className="flex flex-col bg-gray-50 min-h-screen p-6">
//         <h1 className="text-3xl font-bold text-gray-500 mb-6 border border-gray-400 rounded-full px-6 py-2 shadow-md">
//           Profile
//         </h1>
//         <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 flex-grow">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-8">
//             <div className="flex items-center space-x-6">
//               <img
//                 src={doctorImage}
//                 alt="Doctor"
//                 className="w-32 h-32 rounded-full object-cover"
//               />
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-800">
//                   {doctorData.name}
//                 </h1>
//                 <p className="text-gray-600 text-lg">
//                   {doctorData.qualifications} - {doctorData.yearsOfExperience}{" "}
//                   Years
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={toggleEditMode}
//               className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-600"
//             >
//               {isEditing ? (
//                 <>
//                   <FaEdit className="mr-2 hidden" />
//                 </>
//               ) : (
//                 <>
//                   <FaEdit className="mr-2" />
//                   Edit
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Doctor Information */}
//           <div className="space-y-6">
//             {/* About Section */}
//             <div className="space-y-2">
//               <h3 className="text-2xl font-semibold text-gray-800">About:</h3>
//               {isEditing ? (
//                 <textarea
//                   name="about"
//                   value={doctorData.about}
//                   onChange={handleInputChange}
//                   className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   rows="4"
//                 />
//               ) : (
//                 <p className="text-lg text-gray-600">{doctorData.about}</p>
//               )}
//             </div>

//             {/* Appointment Fee and Address Section */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <h3 className="text-2xl font-semibold text-gray-800">
//                   Appointment Fee:
//                 </h3>
//                 {isEditing ? (
//                   <input
//                     type="number"
//                     name="appointmentFee"
//                     value={doctorData.appointmentFee}
//                     onChange={handleInputChange}
//                     className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 ) : (
//                   <p className="text-lg text-gray-600">
//                     ${doctorData.appointmentFee}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <h3 className="text-2xl font-semibold text-gray-800">
//                   Address:
//                 </h3>
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     name="address"
//                     value={doctorData.address}
//                     onChange={handleInputChange}
//                     className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 ) : (
//                   <p className="text-lg text-gray-600">{doctorData.address}</p>
//                 )}
//               </div>
//             </div>

//             {/* Experience and Qualifications Section */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <h3 className="text-2xl font-semibold text-gray-800">
//                   Years of Experience:
//                 </h3>
//                 {isEditing ? (
//                   <input
//                     type="number"
//                     name="yearsOfExperience"
//                     value={doctorData.yearsOfExperience}
//                     onChange={handleInputChange}
//                     className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 ) : (
//                   <p className="text-lg text-gray-600">
//                     {doctorData.yearsOfExperience} Years
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <h3 className="text-2xl font-semibold text-gray-800">
//                   Qualifications:
//                 </h3>
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     name="qualifications"
//                     value={doctorData.qualifications}
//                     onChange={handleInputChange}
//                     className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 ) : (
//                   <p className="text-lg text-gray-600">
//                     {doctorData.qualifications}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Availability Section */}
//             <div className="space-y-2">
//               <h3 className="text-2xl font-semibold text-gray-800">
//                 Availability:
//               </h3>
//               {isEditing ? (
//                 <select
//                   name="available"
//                   value={doctorData.available}
//                   onChange={(e) =>
//                     setDoctorData((prevState) => ({
//                       ...prevState,
//                       available: e.target.value === "true",
//                     }))
//                   }
//                   className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="true">Available</option>
//                   <option value="false">Not Available</option>
//                 </select>
//               ) : (
//                 <p className="text-lg text-green-600">
//                   {doctorData.available ? "Available" : "Not Available"}
//                 </p>
//               )}
//             </div>

//             {/* Save Button */}
//             {isEditing && (
//               <button
//                 onClick={handleSave}
//                 className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
//               >
//                 Save Information
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default Profile;
// import React, { useState, useEffect } from "react";
// import { FaEdit, FaSave } from "react-icons/fa";
// import Layout from "../DoctorComponents/Layout";
// import axios from "axios";

// const Profile = () => {
//   const [doctorData, setDoctorData] = useState(null); // Initial state is null until data is fetched
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(true); // Loading state

//   const doctorId = "674cc15ca5aeceee59956c0a"; // Replace with the actual doctor ID

//   // Fetch data from the backend
//   useEffect(() => {
//     const fetchDoctorData = async () => {
//       try {
        
//         const response = await axios.get(`http://localhost:3080/doctor/get-doctor`, {
//           params: { id: doctorId }, // Pass the ID as a query parameter
//         });
//         console.log("RESPONSE: ",response.data[0])

//         setDoctorData(response.data[0]); // API returns a single doctor object
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching doctor data:", error);
//         setLoading(false);
//       }
//     };

//     fetchDoctorData();
//   }, []);

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setDoctorData((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   // Toggle edit/save mode
//   const toggleEditMode = () => {
//     setIsEditing((prevState) => !prevState);
//   };

//   // Save changes
//   const handleSave = async () => {
//     try {
//       await axios.put(`/doctor/${doctorId}`, doctorData);
//       toggleEditMode();
//       console.log("Saved doctor data:", doctorData);
//     } catch (error) {
//       console.error("Error saving doctor data:", error);
//     }
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (!doctorData) {
//     return <p>Doctor data not found.</p>;
//   }

//   return (
//     <Layout>
//       <div className="flex flex-col bg-gray-50 min-h-screen p-6">
//         <h1 className="text-3xl font-bold text-gray-500 mb-6 border border-gray-400 rounded-full px-6 py-2 shadow-md">
//           Profile
//         </h1>
//         <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 flex-grow">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-8">
//             <div className="flex items-center space-x-6">
//               <img
//                 src={doctorData.image}
//                 alt="Doctor"
//                 className="w-32 h-32 rounded-full object-cover"
//               />
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-800">
//                   {doctorData.name}
//                 </h1>
//                 <p className="text-gray-600 text-lg">
//                   {doctorData.qualifications} - {doctorData.yearsOfExperience}{" "}
//                   Years
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={toggleEditMode}
//               className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-600"
//             >
//               {isEditing ? (
//                 <>
//                   <FaEdit className="mr-2 hidden" />
//                 </>
//               ) : (
//                 <>
//                   <FaEdit className="mr-2" />
//                   Edit
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Doctor Information */}
//           <div className="space-y-6">
//             {/* About Section */}
//             <div className="space-y-2">
//               <h3 className="text-2xl font-semibold text-gray-800">About:</h3>
//               {isEditing ? (
//                 <textarea
//                   name="about"
//                   value={doctorData.about}
//                   onChange={handleInputChange}
//                   className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   rows="4"
//                 />
//               ) : (
//                 <p className="text-lg text-gray-600">{doctorData.about}</p>
//               )}
//             </div>

//             {/* Appointment Fee and Address Section */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <h3 className="text-2xl font-semibold text-gray-800">
//                   Appointment Fee:
//                 </h3>
//                 {isEditing ? (
//                   <input
//                     type="number"
//                     name="appointmentFee"
//                     value={doctorData.appointmentFee}
//                     onChange={handleInputChange}
//                     className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 ) : (
//                   <p className="text-lg text-gray-600">
//                     ${doctorData.appointmentFee}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <h3 className="text-2xl font-semibold text-gray-800">
//                   Address:
//                 </h3>
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     name="address"
//                     value={doctorData.address}
//                     onChange={handleInputChange}
//                     className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 ) : (
//                   <p className="text-lg text-gray-600">{doctorData.address}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Save Button */}
//           {isEditing && (
//             <button
//               onClick={handleSave}
//               className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
//             >
//               Save Information
//             </button>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default Profile;

import React, { useState, useEffect } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import Layout from "../DoctorComponents/Layout";
import axios from "axios";

const Profile = () => {
  const [doctorData, setDoctorData] = useState(null); // Initial state is null until data is fetched
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const doctorId = "674cc15ca5aeceee59956c0a"; // Replace with the actual doctor ID

  // Fetch data from the backend
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await axios.get("http://localhost:3080/doctor/get-doctor", {
          params: { id: doctorId }, // Pass the ID as a query parameter
        });
        console.log("RESPONSE: ", response.data[0]);

        setDoctorData(response.data[0]); // API returns a single doctor object
        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Toggle edit/save mode
  const toggleEditMode = () => {
    setIsEditing((prevState) => !prevState);
  };

  // Save changes
  const handleSave = async () => {
    try {
      await axios.put(`/doctor/${doctorId}`, doctorData);
      toggleEditMode();
      console.log("Saved doctor data:", doctorData);
    } catch (error) {
      console.error("Error saving doctor data:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!doctorData) {
    return <p>Doctor data not found.</p>;
  }

  return (
    <Layout>
      <div className="flex flex-col bg-gray-50 min-h-screen p-6">
        <h1 className="text-3xl font-bold text-gray-500 mb-6 border border-gray-400 rounded-full px-6 py-2 shadow-md">
          Profile
        </h1>
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8 flex-grow">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <img
                src={doctorData.image}
                alt="Doctor"
                className="w-32 h-32 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {doctorData.name}
                </h1>
                <p className="text-gray-600 text-lg">
                  {doctorData.qualifications} - {doctorData.experience} Years
                </p>
              </div>
            </div>
            <button
              onClick={toggleEditMode}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-600"
            >
              {isEditing ? (
                <>
                  <FaSave className="mr-2 hidden" />
                </>
              ) : (
                <>
                  <FaEdit className="mr-2" />
                  Edit
                </>
              )}
            </button>
          </div>

          {/* Doctor Information */}
          <div className="space-y-6">
            {/* About Section */}
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-gray-800">About:</h3>
              {isEditing ? (
                <textarea
                  name="about"
                  value={doctorData.about}
                  onChange={handleInputChange}
                  className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              ) : (
                <p className="text-lg text-gray-600">{doctorData.about}</p>
              )}
            </div>

            {/* Appointment Fee and Address Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Appointment Fee:
                </h3>
                {isEditing ? (
                  <input
                    type="number"
                    name="fees"
                    value={doctorData.fees}
                    onChange={handleInputChange}
                    className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg text-gray-600">
                    ${doctorData.fees}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Address:
                </h3>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="addressLine1"
                      value={doctorData.address.line1}
                      onChange={handleInputChange}
                      className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="addressLine2"
                      value={doctorData.address.line2}
                      onChange={handleInputChange}
                      className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <p className="text-lg text-gray-600">
                    {doctorData.address.line1}, {doctorData.address.line2}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <button
              onClick={handleSave}
              className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Save Information
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
