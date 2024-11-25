import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-white text-gray-600 flex flex-col shadow-md">
      {/* Sidebar Header */}
      <div className="py-6 px-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-center text-blue-800">DOCTOR</h2>
        <p className="text-sm text-center text-gray-400 mt-1">Dashboard Panel</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow mt-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/docDashboard"
              className="flex items-center px-6 py-3 space-x-4 hover:bg-blue-100 hover:shadow-sm hover:scale-105 transform transition duration-200 rounded-md"
            >
              <span className="text-xl">🏠</span>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/docAppointments"
              className="flex items-center px-6 py-3 space-x-4 hover:bg-blue-100 hover:shadow-sm hover:scale-105 transform transition duration-200 rounded-md"
            >
              <span className="text-xl">📅</span>
              <span>Appointments</span>
            </Link>
          </li>
          <li>
            <Link
              to="/docProfile"
              className="flex items-center px-6 py-3 space-x-4 hover:bg-blue-100 hover:shadow-sm hover:scale-105 transform transition duration-200 rounded-md"
            >
              <span className="text-xl">👤</span>
              <span>Profile</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer (Logout Button) */}
      <div className="px-6 py-4 border-t border-gray-200">
        <button className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
