import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave } from 'react-icons/fa';
import Layout from '../DoctorComponents/Layout';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const location = useLocation();
  const [doctorData, setDoctorData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [image, setImage] = useState(null);
  const { user } = useAuth();

  const email = user?.email;

  const fetchDoctorData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/doctor/get-doctor`, {
        params: { email: email },
      });
      setDoctorData(response.data[0]);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch doctor data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prevState) => ({
      ...prevState,
      address: {
        ...prevState.address,
        [name]: value,
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
      const { image: prevImage, address, ...updatedData } = doctorData;

      const formData = new FormData();

      Object.keys(updatedData).forEach((key) => {
        formData.append(key, updatedData[key]);
      });

      formData.append('address', JSON.stringify(address));

      if (image) {
        formData.append('image', image);
      }

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/doctor/update/${doctorData.email}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      if (response.status === 200) {
        setSuccessMessage('Profile updated successfully.');
        toggleEditMode();
        fetchDoctorData();
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      setError('Failed to save doctor data.');
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <img
                src={doctorData.image || 'default-image.jpg'}
                alt="Doctor"
                className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-primary"
              />
              <div>
                <h1 className="text-3xl font-semibold text-gray-800">{doctorData.name}</h1>
                <p className="text-xl text-gray-600">
                  {doctorData.speciality} | {doctorData.experience} Years Experience
                </p>
              </div>
            </div>
            <button
              onClick={toggleEditMode}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-full shadow-md hover:bg-blue-700 transition"
            >
              <FaEdit />
              <span>{'Edit'}</span>
            </button>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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

            <div>
              <h3 className="text-2xl font-semibold text-gray-800">Appointment Fee</h3>
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

            <div>
              <h3 className="text-2xl font-semibold text-gray-800">Address</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="line1"
                    value={doctorData.address.line1 || ''}
                    onChange={handleAddressChange}
                    className="w-full mt-2 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="line2"
                    value={doctorData.address.line2 || ''}
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

            <div>
              <h3 className="text-2xl font-semibold text-gray-800">Experience</h3>
              {isEditing ? (
                <input
                  type="number"
                  name="experience"
                  value={doctorData.experience}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-2 text-gray-600">{doctorData.experience} Years</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-4">
              <h3 className="text-2xl font-semibold text-gray-800">Update Profile Picture</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2 p-2 border rounded-lg"
              />
            </div>
          )}

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={toggleEditMode}
                className="px-6 py-3 bg-gray-400 text-white rounded-full shadow-md hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-primary text-white rounded-full shadow-md hover:bg-blue-700"
              >
                <FaSave />
                <span> Save</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
