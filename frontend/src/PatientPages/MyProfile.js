// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { assets } from "../assets/assets";

// const MyProfile = () => {
//   const [userData, setUserData] = useState(null);
//   const [isEdit, setIsEdit] = useState(false);
//   const email = "joh9955do@example.com"; // Replace with the actual email of the logged-in patient

//   // Fetch user data from the backend
//   const fetchUserData = async () => {
//     try {
//       const response = await axios.get(`http://localhost:3080/patient/${email}`);
//       setUserData(response.data);
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//     }
//   };

//   // Update user data
//   const updateUserData = async () => {
//     try {
//       await axios.put(`http://localhost:3080/patient/update/${userData.email}`, userData);
//       setIsEdit(false);
//       fetchUserData(); // Refresh data after update
//     } catch (error) {
//       console.error("Error updating user data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   const handleInputChange = (field, value) => {
//     setUserData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleAddressChange = (field, value) => {
//     setUserData((prev) => ({
//       ...prev,
//       address: { ...prev.address, [field]: value },
//     }));
//   };

//   return (
//     <div className="max-w-lg flex flex-col gap-2 text-sm">
//       {userData ? (
//         <>
//           <img className="w-36 rounded" src={userData.image || assets.profile_pic} alt="Profile" />
//           {isEdit ? (
//             <input
//               className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
//               type="text"
//               value={userData.name}
//               onChange={(e) => handleInputChange("name", e.target.value)}
//             />
//           ) : (
//             <p className="font-medium text-3xl text-neutral-800 mt-4">
//               {userData.name}
//             </p>
//           )}

//           <hr className="bg-zinc-400 h-[1px] border-none" />

//           <div>
//             <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
//             <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
//               <p className="font-medium">Email id:</p>
//               <p className="text-blue-500">{userData.email}</p>
//               <p className="font-medium">Phone:</p>
//               {isEdit ? (
//                 <input
//                   className="bg-gray-100 max-w-52"
//                   type="text"
//                   value={userData.phone}
//                   onChange={(e) => handleInputChange("phone", e.target.value)}
//                 />
//               ) : (
//                 <p className="text-blue-400">{userData.phone}</p>
//               )}
//               <p className="font-medium">Address:</p>
//               {isEdit ? (
//                 <div>
//                   <input
//                     className="bg-gray-50"
//                     type="text"
//                     value={userData.address?.line1 || ""}
//                     onChange={(e) => handleAddressChange("line1", e.target.value)}
//                   />
//                   <br />
//                   <input
//                     className="bg-gray-50"
//                     type="text"
//                     value={userData.address?.line2 || ""}
//                     onChange={(e) => handleAddressChange("line2", e.target.value)}
//                   />
//                 </div>
//               ) : (
//                 <p className="text-gray-500">
//                   {userData.address?.line1 || "N/A"}, {userData.address?.line2 || "N/A"}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div>
//             <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
//             <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
//               <p className="font-medium">Gender:</p>
//               {isEdit ? (
//                 <select
//                   className="max-w-20 bg-gray-100"
//                   value={userData.gender}
//                   onChange={(e) => handleInputChange("gender", e.target.value)}
//                 >
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                 </select>
//               ) : (
//                 <p className="text-gray-400">{userData.gender}</p>
//               )}
//               <p className="font-medium">Birth Date:</p>
//               {isEdit ? (
//                 <input
//                   className="max-w-28 bg-gray-100"
//                   type="date"
//                   value={userData.dob}
//                   onChange={(e) => handleInputChange("dob", e.target.value)}
//                 />
//               ) : (
//                 <p className="text-gray-400">{userData.dob}</p>
//               )}
//             </div>
//           </div>

//           <div className="mt-10">
//             {isEdit ? (
//               <button
//                 className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
//                 onClick={updateUserData}
//               >
//                 Save information
//               </button>
//             ) : (
//               <button
//                 className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
//                 onClick={() => setIsEdit(true)}
//               >
//                 Edit
//               </button>
//             )}
//           </div>
//         </>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// };

// export default MyProfile;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { assets } from "../assets/assets";

const MyProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // Preview for image editing
  const email = "ali@gmail.com"; // Replace with the actual email of the logged-in patient

  // Fetch user data from the backend
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:3080/patient/${email}`);
      console.log("USER DATA: ", response.data[0])
      setUserData(response.data[0]);
      setImagePreview(response.data[0].image || assets.profile_pic);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Update user data
  const updateUserData = async () => {
    try {
      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        if (key === "address") {
          formData.append("address[line1]", value.line1 || "");
          formData.append("address[line2]", value.line2 || "");
        } else {
          formData.append(key, value);
        }
      });

      if (userData.image instanceof File) {
        formData.append("image", userData.image);
      }

      await axios.put(`http://localhost:3080/patient/update/${userData.email}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsEdit(false);
      fetchUserData(); // Refresh data after update
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const cancelEdit = () => {
    setIsEdit(false);
    fetchUserData(); // Revert to original data
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      {userData ? (
        <>
          {/* Profile Image */}
          <div className="relative">
            <img
              className="w-36 rounded"
              src={imagePreview || assets.profile_pic}
              alt="Profile"
            />
            {isEdit && (
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Name */}
          {isEdit ? (
            <input
              className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
              type="text"
              value={userData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          ) : (
            <p className="font-medium text-3xl text-neutral-800 mt-4">
              {userData.name}
            </p>
          )}

          <hr className="bg-zinc-400 h-[1px] border-none" />

          {/* Contact Information */}
          <div>
            <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
            <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
              <p className="font-medium">Email id:</p>
              {console.log(userData.email)}
              <p className="text-blue-500">{userData.email}</p>
              <p className="font-medium">Phone:</p>
              {isEdit ? (
                <input
                  className="bg-gray-100 max-w-52"
                  type="text"
                  value={userData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              ) : (
                <p className="text-blue-400">{userData.phone}</p>
              )}
              <p className="font-medium">Address:</p>
              {isEdit ? (
                <div>
                  <input
                    className="bg-gray-50"
                    type="text"
                    value={userData.address?.line1 || ""}
                    onChange={(e) => handleAddressChange("line1", e.target.value)}
                  />
                  <br />
                  <input
                    className="bg-gray-50"
                    type="text"
                    value={userData.address?.line2 || ""}
                    onChange={(e) => handleAddressChange("line2", e.target.value)}
                  />
                </div>
              ) : (
                <p className="text-gray-500">
                  {userData.address?.line1 || "N/A"}, {userData.address?.line2 || "N/A"}
                </p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
            <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
              <p className="font-medium">Gender:</p>
              {isEdit ? (
                <select
                  className="max-w-20 bg-gray-100"
                  value={userData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <p className="text-gray-400">{userData.gender}</p>
              )}
              <p className="font-medium">Birth Date:</p>
              {isEdit ? (
                <input
                  className="max-w-28 bg-gray-100"
                  type="date"
                  value={userData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                />
              ) : (
                <p className="text-gray-400">{userData.dob}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4">
            {isEdit ? (
              <>
                <button
                  className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
                  onClick={updateUserData}
                >
                  Save
                </button>
                <button
                  className="border border-red-500 px-8 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
                onClick={() => setIsEdit(true)}
              >
                Edit
              </button>
            )}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default MyProfile;
