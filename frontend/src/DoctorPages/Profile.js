import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaCamera, FaTimes, FaSpinner } from 'react-icons/fa';
import Layout from '../DoctorComponents/Layout';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const location = useLocation();
  const [doctorData, setDoctorData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const { user } = useAuth();

  const email = user?.email;

  const fetchDoctorData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/doctor/get-doctor`, {
        params: { email: email },
      });
      setDoctorData(response.data[0]);
      setImagePreview(response.data[0].image);
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
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setShowImageModal(false);
    }
  };

  const handleImageUpload = async () => {
    if (!image) return;

    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append('image', image);

      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/doctor/update-image/${doctorData.email}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.status === 200) {
        setSuccessMessage('Profile image updated successfully.');
        fetchDoctorData();
      }
    } catch (error) {
      setError('Failed to update profile image.');
    } finally {
      setImageLoading(false);
      setImage(null);
    }
  };

  const toggleEditMode = () => {
    setIsEditing((prevState) => !prevState);
    if (!isEditing) {
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleSave = async () => {
    try {
      const { image: prevImage, address, ...updatedData } = doctorData;
      const formData = new FormData();

      Object.keys(updatedData).forEach((key) => {
        formData.append(key, updatedData[key]);
      });

      formData.append('address', JSON.stringify(address));

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
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!doctorData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-red-500 font-medium">Doctor data not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
              {/* Profile Image Section */}
              <div className="relative group">
                <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                  <img
                    src={imagePreview || doctorData.image || 'default-image.jpg'}
                    alt="Doctor"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <FaCamera className="text-white text-2xl" />
                  </button>
                </div>
                {image && (
                  <button
                    onClick={handleImageUpload}
                    disabled={imageLoading}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    {imageLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      'Save Image'
                    )}
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="text-center sm:text-left text-white">
                <h1 className="text-3xl font-bold">{doctorData.name}</h1>
                <p className="text-xl opacity-90 mt-2">
                  {doctorData.speciality} | {doctorData.experience} Years Experience
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium">
                    {doctorData.email}
                  </span>
                  <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium">
                    Fee: ${doctorData.fees}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={toggleEditMode}
                className="absolute top-4 right-4 flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-full text-sm font-medium shadow-md hover:bg-blue-50 transition-colors duration-300"
              >
                {isEditing ? (
                  <>
                    <FaSave className="text-sm" />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <FaEdit className="text-sm" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-8 mt-4 bg-red-50 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
              <p>{error}</p>
              <button onClick={() => setError(null)}>
                <FaTimes className="text-red-600" />
              </button>
            </div>
          )}
          {successMessage && (
            <div className="mx-8 mt-4 bg-green-50 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
              <p>{successMessage}</p>
              <button onClick={() => setSuccessMessage(null)}>
                <FaTimes className="text-green-600" />
              </button>
            </div>
          )}

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">About</h3>
                  {isEditing ? (
                    <textarea
                      name="about"
                      value={doctorData.about}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      rows="4"
                    />
                  ) : (
                    <p className="text-gray-600 leading-relaxed">{doctorData.about}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Appointment Fee</h3>
                  {isEditing ? (
                    <input
                      type="number"
                      name="fees"
                      value={doctorData.fees}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-gray-600">${doctorData.fees}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Address</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="line1"
                      placeholder="Address Line 1"
                      value={doctorData.address.line1 || ''}
                      onChange={handleAddressChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                    <input
                      type="text"
                      name="line2"
                      placeholder="Address Line 2"
                      value={doctorData.address.line2 || ''}
                      onChange={handleAddressChange}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <p>{doctorData.address.line1}</p>
                    <p>{doctorData.address.line2}</p>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 max-w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Update Profile Picture</h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-colors duration-300"
                  >
                    <FaCamera className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="text-gray-600">Click to upload a new photo</p>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG or GIF (max. 2MB)
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
