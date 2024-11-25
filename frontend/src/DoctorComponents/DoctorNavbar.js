import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
const Navbar = () => {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Logo Section */}
      <div className="flex items-center">
      <img
       // onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="w-44 cursor-pointer"
      />
        <p className="ml-2 text-gray-500 border border-gray-300 rounded-full px-2 py-1 text-sm">
          Doctor
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">

        {/* Logout Button */}
        <button className="bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-600">
          Logout
        </button>

      </div>
    </header>
  );
};

export default Navbar;
