import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DoctorNavbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [imagePreview, setImagePreview] = useState(assets.profile_pic);
  const { setUser, user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!email) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/doctor/get-doctor?email=${email}`,
        );

        if (response.data && response.data.length > 0) {
          setDoctorData(response.data[0]);
          setImagePreview(response.data[0]?.image || assets.profile_pic);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      }
    };

    fetchDoctorData();
  }, [email]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setImagePreview(assets.profile_pic);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 max-h-23">
      {/* Logo */}
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="Logo"
        className="w-44 cursor-pointer hover:opacity-80 transition-opacity duration-200"
      />

      {/* Navigation Links */}
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/doctor/dashboard" className={({ isActive }) => isActive ? 'text-blue-600' : ''}>
          <li className="py-1 hover:text-blue-600 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:bottom-0 hover:after:w-full after:transition-all after:duration-300">
            DASHBOARD
          </li>
        </NavLink>

        <NavLink to="/doctor/blogs" className={({ isActive }) => isActive ? 'text-blue-600' : ''}>
          <li className="py-1 hover:text-blue-600 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:bottom-0 hover:after:w-full after:transition-all after:duration-300">
            ADD-BLOGS
          </li>
        </NavLink>

        <NavLink to="/doctor/blogs/list" className={({ isActive }) => isActive ? 'text-blue-600' : ''}>
          <li className="py-1 hover:text-blue-600 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:bottom-0 hover:after:w-full after:transition-all after:duration-300">
            ALL-BLOGS
          </li>
        </NavLink>
      </ul>

      {/* Profile & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer group relative">
          <img 
            className="w-8 rounded-full ring-2 ring-transparent hover:ring-blue-600 transition-all duration-200" 
            src={imagePreview} 
            alt="Doctor" 
          />
          <img 
            className="w-2.5 group-hover:rotate-180 transition-transform duration-300" 
            src={assets.dropdown_icon} 
            alt="Dropdown" 
          />
          <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="min-w-48 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
              <p
                onClick={() => navigate('/doctor/profile')}
                className="p-3 hover:bg-blue-50 transition-colors duration-200"
              >
                My Profile
              </p>
              <p
                onClick={() => navigate('/doctor/appointments')}
                className="p-3 hover:bg-blue-50 transition-colors duration-200"
              >
                My Appointments
              </p>
              <p 
                onClick={handleLogout} 
                className="p-3 hover:bg-red-50 text-red-600 transition-colors duration-200"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden hover:opacity-80 transition-opacity duration-200 cursor-pointer"
          src={assets.menu_icon}
          alt="Menu"
        />
      </div>
    </div>
  );
};

export default DoctorNavbar;
