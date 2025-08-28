import { useState, useEffect } from 'react';
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
  const [isSliding, setIsSliding] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Initial animation
    setIsSliding(true);
    const timer = setTimeout(() => setIsSliding(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Trigger slide animation on role change if it's the role field
    if (name === 'role') {
      setIsSliding(true);
      setTimeout(() => setIsSliding(false), 800);
    }
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
        setIsSliding(true);
        setTimeout(() => {
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
        }, 600);
      }
    } catch (error) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Half: Logo Section with slide effect */}
      <div 
        className={`w-1/2 bg-gradient-to-br from-blue-50 to-white flex justify-center items-center transform transition-transform duration-700 ease-in-out
          ${isSliding ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        <div className="flex flex-col justify-center items-center w-full h-full p-12">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-full max-w-md h-auto object-contain transform hover:scale-105 transition-transform duration-300"
          />
          <h1 className="mt-8 text-3xl font-bold text-gray-800 text-center">
            Welcome to {formData.role === 'patient' ? 'Patient Portal' : 
                       formData.role === 'doctor' ? 'Doctor Portal' : 'Admin Portal'}
          </h1>
          <p className="mt-4 text-gray-600 text-center max-w-md">
            Your trusted healthcare platform for managing appointments and medical records.
          </p>
        </div>
      </div>

      {/* Right Half: Login Form with slide effect */}
      <div 
        className={`w-1/2 bg-white p-8 flex flex-col justify-center items-center transform transition-transform duration-700 ease-in-out
          ${isSliding ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        <div className="w-full max-w-md p-8 rounded-2xl bg-white shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
          {message && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-center">{message}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Login as</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium
                hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to={`/signup/${formData.role}`} 
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
