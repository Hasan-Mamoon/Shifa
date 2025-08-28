import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';

const Signup = () => {
  const { userType } = useParams();
  const navigate = useNavigate();
  const [isSliding, setIsSliding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    gender: 'Male',
    medicalHistory: '',
    address: { line1: '', line2: '' },
    dob: '',
    speciality: '',
    experience: '',
    about: '',
    fees: '',
    degree: null,
    image: null,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (!['doctor', 'patient'].includes(userType)) {
      navigate('/signup/patient');
    }
    setIsSliding(true);
    const timer = setTimeout(() => setIsSliding(false), 800);
    return () => clearTimeout(timer);
  }, [userType, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prevData) => ({
        ...prevData,
        address: { ...prevData.address, [field]: value },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (e.target.name === 'image') {
        setSelectedImage(URL.createObjectURL(file));
      }
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSliding(true);

    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.image ||
      !formData.address.line1 ||
      !formData.address.line2
    ) {
      setError('Please fill all required fields.');
      setIsSliding(false);
      return;
    }

    if (
      userType === 'doctor' &&
      (!formData.speciality ||
        !formData.degree ||
        !formData.experience ||
        !formData.about ||
        !formData.fees)
    ) {
      setError('Please fill all required fields for doctor signup.');
      setIsSliding(false);
      return;
    }

    const form = new FormData();
    form.append('email', formData.email);
    form.append('password', formData.password);
    form.append('name', formData.name);
    form.append('image', formData.image);
    form.append('address[line1]', formData.address.line1);
    form.append('address[line2]', formData.address.line2);

    if (userType === 'patient') {
      form.append('phone', formData.phone);
      form.append('gender', formData.gender);
      form.append('medicalHistory', formData.medicalHistory);
      form.append('dob', formData.dob);
    } else {
      form.append('speciality', formData.speciality);
      form.append('experience', formData.experience);
      form.append('about', formData.about);
      form.append('fees', formData.fees);
      form.append('degree', formData.degree);
    }

    try {
      const url =
        userType === 'doctor'
          ? `${process.env.REACT_APP_SERVER_URL}/doctor/add-doctor`
          : `${process.env.REACT_APP_SERVER_URL}/patient/add-patient`;

      await axios.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } });

      setTimeout(() => {
        if (userType === 'doctor') {
          alert('Doctor registration submitted. Pending for approval.');
        } else {
          alert('Patient registered successfully.');
        }
        navigate('/login');
      }, 600);
    } catch (error) {
      setIsSliding(false);
      setError(`Error registering ${userType}. Please try again.`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Half: Logo Section */}
      <div 
        className={`hidden md:flex w-1/2 bg-gradient-to-br from-blue-50 to-white flex-col justify-center items-center transform transition-transform duration-700 ease-in-out
          ${isSliding ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        <div className="flex flex-col justify-center items-center w-full p-12">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-full max-w-md h-auto object-contain transform hover:scale-105 transition-transform duration-300"
          />
          <h1 className="mt-8 text-3xl font-bold text-gray-800 text-center">
            Create Your {userType === 'doctor' ? 'Doctor' : 'Patient'} Account
          </h1>
          <p className="mt-4 text-gray-600 text-center max-w-md">
            Join our healthcare platform to manage your medical journey efficiently.
          </p>
        </div>
      </div>

      {/* Right Half: Form Section */}
      <div 
        className={`w-full md:w-1/2 bg-white p-4 md:p-8 flex flex-col justify-center items-center transform transition-transform duration-700 ease-in-out
          ${isSliding ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        <div className="w-full max-w-2xl p-6 rounded-2xl bg-white shadow-lg overflow-y-auto max-h-screen">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            {userType === 'doctor' ? 'Doctor' : 'Patient'} Signup
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full border-2 border-gray-300 overflow-hidden mb-2">
                {selectedImage ? (
                  <img src={selectedImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                Upload Profile Picture
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address Line 1</label>
                <input
                  type="text"
                  name="address.line1"
                  placeholder="Enter address line 1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address Line 2</label>
                <input
                  type="text"
                  name="address.line2"
                  placeholder="Enter address line 2"
                  value={formData.address.line2}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Patient-specific fields */}
            {userType === 'patient' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-gray-700">Medical History</label>
                  <textarea
                    name="medicalHistory"
                    placeholder="Enter any relevant medical history"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {/* Doctor-specific fields */}
            {userType === 'doctor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Speciality</label>
                  <select
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Select Speciality</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                    <option value="General Physician">General physician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatricians">Pediatricians</option>
                    <option value="Neurologist">Neurologist</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    placeholder="Years of experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-gray-700">About</label>
                  <textarea
                    name="about"
                    placeholder="Tell us about yourself"
                    value={formData.about}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Consultation Fees</label>
                  <input
                    type="number"
                    name="fees"
                    placeholder="Enter consultation fees"
                    value={formData.fees}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Degree Certificate</label>
                  <div className="relative">
                    <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 block text-center">
                      Upload Degree (PNG, JPG, JPEG)
                      <input
                        type="file"
                        name="degree"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="hidden"
                        id="fileUpload"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium mt-6
                hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
