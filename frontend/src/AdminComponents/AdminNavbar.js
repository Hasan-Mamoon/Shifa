import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-gray-400 max-h-23">
     
      <img
        onClick={() => navigate('/admin')}
        src={assets.logo}
        alt="Logo"
        className="w-44 cursor-pointer"
      />

     
      <nav className="hidden md:flex items-start gap-5 font-medium">
        <button onClick={() => navigate('/admin/dashboard')} >
         DASHBOARD
        </button>
      </nav>

     
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminNavbar;
