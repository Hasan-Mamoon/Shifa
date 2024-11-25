import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineHome, AiOutlineCalendar, AiOutlineUser } from "react-icons/ai"; // Importing appropriate icons

const Sidebar = () => {
  const location = useLocation(); 

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-white text-gray-600 flex flex-col shadow-md">
      <div className="py-6 px-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-center text-blue-800">DOCTOR</h2>
        <p className="text-sm text-center text-gray-400 mt-1">Dashboard Panel</p>
      </div>

      <nav className="flex-grow mt-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/docDashboard"
              className={`flex items-center px-6 py-3 space-x-4 hover:bg-blue-100 hover:shadow-sm hover:scale-105 transform transition duration-200 rounded-md ${
                isActive("/docDashboard") ? "border-l-4 border-blue-500 text-blue-700" : "text-gray-700"
              }`}
            >
              <AiOutlineHome className="text-xl" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/docAppointments"
              className={`flex items-center px-6 py-3 space-x-4 hover:bg-blue-100 hover:shadow-sm hover:scale-105 transform transition duration-200 rounded-md ${
                isActive("/docAppointments") ? "border-l-4 border-green-500 text-green-700" : "text-gray-700"
              }`}
            >
              <AiOutlineCalendar className="text-xl" />
              <span>Appointments</span>
            </Link>
          </li>
          <li>
            <Link
              to="/docProfile"
              className={`flex items-center px-6 py-3 space-x-4 hover:bg-blue-100 hover:shadow-sm hover:scale-105 transform transition duration-200 rounded-md ${
                isActive("/docProfile") ? "border-l-4 border-gray-700 text-gray-800" : "text-gray-700"
              }`}
            >
              <AiOutlineUser className="text-xl" />
              <span>Profile</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="px-6 py-4 border-t border-gray-200">
        <button className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
