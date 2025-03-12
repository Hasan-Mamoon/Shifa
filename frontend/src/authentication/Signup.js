import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';

const Signup = () => {
  const { userType } = useParams();
  const navigate = useNavigate();

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
      navigate('/signup/patient'); // Default to patient if incorrect URL
    }
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
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.image ||
      !formData.address.line1 ||
      !formData.address.line2
    ) {
      setError('Please fill all required fields.');
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

      if (userType === 'doctor') {
        alert('Doctor registration submitted. Pending for approval.');
      } else {
        alert('Patient registered successfully.');
      }
      navigate('/login');
    } catch (error) {
      setError(`Error registering ${userType}. Please try again.`);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="max-w-lg mx-auto  bg-white rounded-lg ">
        <h2 className="text-2xl font-bold mb-2 text-center">
          {userType === 'doctor' ? 'Doctor' : 'Patient'} Signup
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            name="address.line1"
            placeholder="Address Line 1"
            value={formData.address.line1}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="address.line2"
            placeholder="Address Line 2"
            value={formData.address.line2}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          {userType === 'patient' && (
            <>
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                name="medicalHistory"
                placeholder="Medical History"
                value={formData.medicalHistory}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </>
          )}

          {userType === 'doctor' && (
            <>
              <select
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                required
                className="w-full p-1 border rounded"
              >
                <option value="">Select Speciality</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
                <option value="General Physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
              </select>

              <input
                type="text"
                name="experience"
                placeholder="Experience (years)"
                value={formData.experience}
                onChange={handleChange}
                required
                className="w-full  border rounded"
              />
              <textarea
                name="about"
                placeholder="About Yourself"
                value={formData.about}
                onChange={handleChange}
                required
                className="w-full  border rounded"
              />
              <input
                type="number"
                name="fees"
                placeholder="Consultation Fees"
                value={formData.fees}
                onChange={handleChange}
                required
                className="w-full  border rounded"
              />
              <label className="block text-sm font-medium text-gray-700">
                Upload Degree Certificate
              </label>
              <div className="border rounded  cursor-pointer bg-gray-100 hover:bg-gray-200">
                <input
                  type="file"
                  name="degree"
                  accept=".pdf, .jpg, .png"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                  id="degreeUpload"
                />
                <label htmlFor="degreeUpload" className="cursor-pointer block text-center">
                  Click to upload (PDF, JPG, PNG)
                </label>
              </div>
            </>
          )}

          <label className="block text-sm font-medium text-gray-700">Upload Profile Picture</label>
          <div className="border rounded  cursor-pointer bg-gray-100 hover:bg-gray-200">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="hidden"
              id="fileUpload"
            />
            <label htmlFor="fileUpload" className="cursor-pointer block text-center">
              Click to upload (PDF, JPG, PNG)
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 underline">
            Login here
          </Link>
        </p>
      </div>
      <div className="w-1/2 bg-gradient-to-r from-white to-primary flex justify-center items-center">
        <div className="flex justify-center items-center w-full h-full">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-full h-full object-contain" // Stretch image to fill the container
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
