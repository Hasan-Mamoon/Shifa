import { useState } from "react";  
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    medicalHistory: "",
    address: { line1: "", line2: "" },
    dob: "",
    password: "", 
    image: null,
  });

  const [error, setError] = useState("");
  const [errorMessages, setErrorMessages] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    medicalHistory: "",
    dob: "",
    password: "",
    image: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const validateForm = () => {
    let isValid = true;
    let tempErrorMessages = {};

    // Validate Name
    if (!formData.name) {
      tempErrorMessages.name = "Full name is required.";
      isValid = false;
    }

    // Validate Email
    if (!formData.email) {
      tempErrorMessages.email = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrorMessages.email = "Invalid email address.";
      isValid = false;
    }

    // Validate Phone
    if (!formData.phone) {
      tempErrorMessages.phone = "Phone number is required.";
      isValid = false;
    } else if (!/^\d+$/.test(formData.phone)) {
      tempErrorMessages.phone = "Phone number must be numeric.";
      isValid = false;
    }

    // Validate Gender
    if (!formData.gender) {
      tempErrorMessages.gender = "Gender is required.";
      isValid = false;
    }

    // Validate Date of Birth
    if (!formData.dob) {
      tempErrorMessages.dob = "Date of birth is required.";
      isValid = false;
    }

    // Validate Password
    if (!formData.password) {
      tempErrorMessages.password = "Password is required.";
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrorMessages.password = "Password must be at least 6 characters long.";
      isValid = false;
    }

    // Validate Profile Image
    if (!formData.image) {
      tempErrorMessages.image = "Please upload a profile image.";
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

    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    form.append("gender", formData.gender);
    form.append("medicalHistory", formData.medicalHistory);
    form.append("address[line1]", formData.address.line1);
    form.append("address[line2]", formData.address.line2);
    form.append("dob", formData.dob);
    form.append("password", formData.password); 
    form.append("image", formData.image);

    try {
      await axios.post("http://localhost:3080/patient/add-patient", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/login");
    } catch (error) {
      setError("Failed to signup. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Patient Signup</h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          {errorMessages.name && <p className="text-red-500 text-sm">{errorMessages.name}</p>}
        </div>

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
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          {errorMessages.phone && <p className="text-red-500 text-sm">{errorMessages.phone}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errorMessages.gender && <p className="text-red-500 text-sm">{errorMessages.gender}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          {errorMessages.dob && <p className="text-red-500 text-sm">{errorMessages.dob}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">Medical History</label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            id="line1"
            name="address.line1"
            value={formData.address.line1}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line1: e.target.value } })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Address Line 1"
            required
          />
          <input
            type="text"
            id="line2"
            name="address.line2"
            value={formData.address.line2}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, line2: e.target.value } })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Address Line 2"
            required
          />
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

        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Profile Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleFileChange}
            className="mt-1 block w-full"
            accept="image/*"
            required
          />
          {errorMessages.image && <p className="text-red-500 text-sm">{errorMessages.image}</p>}
        </div>

        <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
