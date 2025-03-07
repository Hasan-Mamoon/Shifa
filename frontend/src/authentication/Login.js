import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const location = useLocation();
  const message = location.state?.message || ''; // Get message from state if redirected
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
      const endpoint = formData.role === 'doctor' ? 'doctor/login' : 'patient/login';
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

        // Redirect based on role
        navigate(formData.role === 'doctor' ? '/doctor/dashboard' : '/');
      }
    } catch (error) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      {/* Display redirect message if exists */}
      {message && <p className="text-yellow-600 text-center mb-4">{message}</p>}

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
  );
};

export default Login;
