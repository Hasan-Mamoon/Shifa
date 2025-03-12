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
        className="w-44 cursor-pointer"
      />

      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1">HOME</li>
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1">ALL DOCTORS</li>
        </NavLink>
        <NavLink to="/about">
          <li className="py-1">ABOUT</li>
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">CONTACT</li>
        </NavLink>
        <NavLink to="/blogs">
          <li className="py-1">HEALTH-BLOGS</li>
        </NavLink>

        {/* Pharmacy Dropdown */}
        <div className="relative">
          <li
            className="py-1 cursor-pointer"
            onClick={() => setShowPharmacyDropdown(!showPharmacyDropdown)}
          >
            PHARMACY ▼
          </li>
          {showPharmacyDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
              {pharmacies.map((pharmacy) => (
                <p
                  key={pharmacy.id}
                  className="cursor-pointer hover:bg-gray-100 p-2"
                  onClick={() => navigate(`/pharmacy/${pharmacy.id}`)}
                >
                  {pharmacy.name}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Labs Dropdown */}
        <div className="relative">
          <li className="py-1 cursor-pointer" onClick={() => setShowLabDropdown(!showLabDropdown)}>
            LABS ▼
          </li>
          {showLabDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
              {labs.map((lab) => (
                <p
                  key={lab.id}
                  className="cursor-pointer hover:bg-gray-100 p-2"
                  onClick={() => navigate(`/lab/${lab.id}`)}
                >
                  {lab.name}
                </p>
              ))}
            </div>
          )}
        </div>
      </ul>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img className="w-8 rounded-full" src={imagePreview} alt="User" />
            <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p
                  onClick={() => navigate('/my-profile')}
                  className="hover:text-black cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate('/my-appointments')}
                  className="hover:text-black cursor-pointer"
                >
                  My Appointments
                </p>
                <p onClick={handleLogout} className="hover:text-black cursor-pointer p-2">
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <NavLink to="/login">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Login</button>
          </NavLink>
        )}

        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="Menu"
        />
      </div>
    </div>
  );
};

export default Navbar;
