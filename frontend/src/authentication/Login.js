import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assets } from '../assets/assets';

const Login = () => {
  const location = useLocation();
  const message = location.state?.message || '';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let endpoint = '';
      if (formData.role === 'doctor') {
        endpoint = 'doctor/login';
      } else if (formData.role === 'patient') {
        endpoint = 'patient/login';
      } else if (formData.role === 'admin') {
        endpoint = 'admin/login';
      }

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/${endpoint}`,
        formData,
      );

      if (response.data.token) {
        login({
          id: response.data.userId,
          token: response.data.token,
          role: formData.role,
          email: response.data.email,
        });

        if (formData.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else if (formData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Half: Login Form */}
      <div className="w-1/2 bg-white p-8 flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        {message && <p className="text-yellow-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
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
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Login as
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link to={`/signup/${formData.role}`} className="text-blue-600 underline">
            Create an account
          </Link>
        </p>
      </div>

      {/* Right Half: Logo Section */}
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

export default Login;
