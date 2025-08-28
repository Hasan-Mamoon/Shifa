import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pharmacies = [
  { id: 'pharmacy1', name: 'Dawaai' },
  { id: 'pharmacy2', name: 'Healthwire' },
  { id: 'pharmacy3', name: 'DVAGO' },
];

const labs = [
  { id: 'lab1', name: 'Islamabad Diagnostic Centre (IDC)' },
  { id: 'lab2', name: 'Chughtai Lab' },
  { id: 'lab3', name: 'Mughal Labs' },
  { id: 'lab4', name: 'Shifa4U' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [imagePreview, setImagePreview] = useState(assets.profile_pic);
  const [showPharmacyDropdown, setShowPharmacyDropdown] = useState(false);
  const [showLabDropdown, setShowLabDropdown] = useState(false);
  const { setUser } = useAuth();
  const { user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    const fetchUserData = async () => {
      if (email === undefined || email == null) {
        console.log('Email is undefined');
        return;
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/patient/${email}`);

        setUserData(response.data);
        setImagePreview(response.data.image || assets.profile_pic);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [email]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setImagePreview(assets.profile_pic);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 max-h-23">
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="Logo"
        className="w-44 cursor-pointer hover:opacity-80 transition-opacity duration-200"
      />

      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/" className={({ isActive }) => isActive ? 'text-blue-600' : ''}>
          <li className="py-1 hover:text-blue-600 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:bottom-0 hover:after:w-full after:transition-all after:duration-300">HOME</li>
        </NavLink>
        <NavLink to="/doctors" className={({ isActive }) => isActive ? 'text-blue-600' : ''}>
          <li className="py-1 hover:text-blue-600 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:bottom-0 hover:after:w-full after:transition-all after:duration-300">ALL DOCTORS</li>
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'text-blue-600' : ''}>
          <li className="py-1 hover:text-blue-600 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:bottom-0 hover:after:w-full after:transition-all after:duration-300">ABOUT</li>
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-blue-600' : ''}>
          <li className="py-1 hover:text-blue-600 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:bottom-0 hover:after:w-full after:transition-all after:duration-300">CONTACT</li>
        </NavLink>
        <NavLink to="/blogs" className={({ isActive }) => isActive ? 'text-blue-600' : ''}>
          <li className="py-1 hover:text-blue-600 transition-colors duration-200 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-600 after:left-0 after:bottom-0 hover:after:w-full after:transition-all after:duration-300">HEALTH-BLOGS</li>
        </NavLink>

        {/* Pharmacy Dropdown */}
        <div className="relative group">
          <li className="py-1 cursor-pointer hover:text-blue-600 transition-colors duration-200">
            PHARMACY ▼
          </li>
          <div className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            {pharmacies.map((pharmacy) => (
              <p
                key={pharmacy.id}
                className="cursor-pointer hover:bg-blue-50 p-3 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => navigate(`/pharmacy/${pharmacy.id}`)}
              >
                {pharmacy.name}
              </p>
            ))}
          </div>
        </div>

        {/* Labs Dropdown */}
        <div className="relative group">
          <li className="py-1 cursor-pointer hover:text-blue-600 transition-colors duration-200">
            LABS ▼
          </li>
          <div className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            {labs.map((lab) => (
              <p
                key={lab.id}
                className="cursor-pointer hover:bg-blue-50 p-3 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => navigate(`/lab/${lab.id}`)}
              >
                {lab.name}
              </p>
            ))}
          </div>
        </div>
      </ul>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img className="w-8 rounded-full ring-2 ring-transparent hover:ring-blue-600 transition-all duration-200" src={imagePreview} alt="User" />
            <img className="w-2.5 group-hover:rotate-180 transition-transform duration-300" src={assets.dropdown_icon} alt="Dropdown" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="min-w-48 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
                <p
                  onClick={() => navigate('/my-profile')}
                  className="p-3 hover:bg-blue-50 transition-colors duration-200"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate('/my-appointments')}
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
        ) : (
          <NavLink to="/login">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105 active:scale-95">
              Login
            </button>
          </NavLink>
        )}

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

export default Navbar;
