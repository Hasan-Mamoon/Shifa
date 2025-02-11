import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <img src={assets.logo} alt="" className="w-44 cursor-pointer" />
        <p className="ml-2 text-gray-500 border border-gray-300 rounded-full px-2 py-1 text-sm">
          Doctor
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
