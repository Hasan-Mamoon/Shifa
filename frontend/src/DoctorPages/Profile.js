import React, { useState, useEffect } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import Layout from "../DoctorComponents/Layout";
import axios from "axios";

const Profile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [image, setImage] = useState(null); // Track image upload

  const doctorId = "674cc15ca5aeceee59956c0a"; // Replace with the actual doctor ID

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3080/doctor/get-doctor",
          {
            params: { id: doctorId },
          }
        );
        setDoctorData(response.data[0]);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch doctor data.");
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    // Update only the specific address field, preserving the others
    setDoctorData((prevState) => ({
      ...prevState,
      address: {
        ...prevState.address, // Keep the existing address fields
        [name]: value, // Update only the changed field (line1, line2, etc.)
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const toggleEditMode = () => {
    setIsEditing((prevState) => !prevState);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      const { image: prevImage, address, ...updatedData } = doctorData;
  
      // Append all other fields except the image and address
      for (let key in updatedData) {
        if (updatedData[key] !== undefined) {
          formData.append(key, updatedData[key]);
        }
      }
  
      // Append address fields individually
      if (address) {
        Object.keys(address).forEach((key) => {
          if (address[key] !== undefined) {
            formData.append(`address[${key}]`, address[key]);
          }
        });
      }
  
      // If a new image is selected, append it to FormData
      if (image) {
        formData.append("image", image);
      }
  
      // Send the form data with the updated information
      const response = await axios.put(
        `http://localhost:3080/doctor/update/${doctorData.email}`, 
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      if (response.status === 200) {
        setSuccessMessage("Profile updated successfully.");
        toggleEditMode(); // Switch back to non-edit mode
      }
    } catch (error) {
      setError("Failed to save doctor data.");
    }
  };
  

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (!doctorData) {
    return <p className="text-center text-red-500">Doctor data not found.</p>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <img
                src={doctorData.image || "default-image.jpg"} // Fallback to default image if doctorData.image is not available
                alt="Doctor"
                className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-primary"
              />
              <div>
                <h1 className="text-3xl font-semibold text-gray-800">
                  {doctorData.name}
                </h1>
                <p className="text-xl text-gray-600">
                  {doctorData.speciality} | {doctorData.experience} Years
                  Experience
                </p>
              </div>
            </div>
            <button
              onClick={toggleEditMode}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-full shadow-md hover:bg-blue-700 transition"
            >
              {<FaEdit />}
              <span>{"Edit"}</span>
            </button>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
              <p>{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
              <p>{successMessage}</p>
            </div>
          )}

          {/* Profile Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800">About</h3>
              {isEditing ? (
                <textarea
                  name="about"
                  value={doctorData.about}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-2 text-gray-600">{doctorData.about}</p>
              )}
            </div>

            {/* Appointment Fee Section */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800">
                Appointment Fee
              </h3>
              {isEditing ? (
                <input
                  type="number"
                  name="fees"
                  value={doctorData.fees}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-2 text-gray-600">${doctorData.fees}</p>
              )}
            </div>

            {/* Address Section */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800">Address</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="line1"
                    value={doctorData.address.line1 || ""} // Ensure there's a fallback value
                    onChange={handleAddressChange}
                    className="w-full mt-2 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="line2"
                    value={doctorData.address.line2 || ""} // Ensure there's a fallback value
                    onChange={handleAddressChange}
                    className="w-full mt-2 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <p className="mt-2 text-gray-600">
                  {doctorData.address.line1}, {doctorData.address.line2}
                </p>
              )}
            </div>

            {/* Experience Section */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800">
                Experience
              </h3>
              {isEditing ? (
                <input
                  type="number"
                  name="experience"
                  value={doctorData.experience}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-2 text-gray-600">
                  {doctorData.experience} Years
                </p>
              )}
            </div>
          </div>

          {/* Image Update Section */}
          {isEditing && (
            <div className="mt-4">
              <h3 className="text-2xl font-semibold text-gray-800">
                Update Profile Picture
              </h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2 p-2 border rounded-lg"
              />
            </div>
          )}

          {/* Save Button */}
          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={toggleEditMode}
                className="px-6 py-3 bg-gray-400 text-white rounded-full shadow-md hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-primary transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
