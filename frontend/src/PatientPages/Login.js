import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [errorMessages, setErrorMessages] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    let tempErrorMessages = {};

    // Validate Email
    if (!formData.email) {
      tempErrorMessages.email = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrorMessages.email = "Invalid email address.";
      isValid = false;
    }

    // Validate Password
    if (!formData.password) {
      tempErrorMessages.password = "Password is required.";
      isValid = false;
    }

    setErrorMessages(tempErrorMessages);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3080/patient/login", formData);
      // Assuming a successful login response includes a token or user data
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token); // Store token
        localStorage.setItem("userEmail", formData.email); // Store email
        navigate("/dashboard"); // Redirect to dashboard or another page
      }
    } catch (error) {
      setError("Failed to login. Please check your credentials.");
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Patient Login</h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          {errorMessages.email && <p className="text-red-500 text-sm">{errorMessages.email}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          {errorMessages.password && <p className="text-red-500 text-sm">{errorMessages.password}</p>}
        </div>

        <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Login</button>
      </form>
    </div>
  );
};

export default Login;
