import React from "react";
import Layout from "../DoctorComponents/Layout";
import { FaCalendarAlt, FaDollarSign, FaUserFriends } from "react-icons/fa";
import currencySymbol from "../context/AppContext";

// Icons for visual enhancement

const Dashboard = () => {
  return (
    <Layout>
      <div className="flex flex-col flex-grow p-6 bg-gray-50">
        {/* Dashboard Title */}
        <h1 className="text-3xl font-bold text-gray-500 mb-6 border border-gray-400 rounded-full px-6 py-2 shadow-md">
          Dashboard
        </h1>

        {/* Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Appointments Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-md rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-center space-x-4 mb-4">
              <FaCalendarAlt className="text-blue-500 text-3xl" />
              <h2 className="text-xl font-semibold text-gray-800">
                Patient Appointments
              </h2>
            </div>
            <div className="text-gray-600">
              <p className="mb-2">
                Total Appointments:{" "}
                <span className="font-bold text-blue-500">45</span>
              </p>
              <p className="mb-2">
                Upcoming: <span className="font-bold text-green-500">10</span>
              </p>
              <p className="mb-2">
                Completed: <span className="font-bold text-gray-800">30</span>
              </p>
              <p className="mb-2">
                Cancelled: <span className="font-bold text-red-500">5</span>
              </p>
            </div>
            <button className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              View All Appointments
            </button>
          </div>

          {/* Earnings Card */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 shadow-md rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-center space-x-4 mb-4">
              <FaDollarSign className="text-green-500 text-3xl" />
              <h2 className="text-xl font-semibold text-gray-800">Earnings</h2>
            </div>
            <div className="text-gray-600">
              <p className="mb-2">
                Total Earnings:{" "}
                <span className="font-bold text-green-500">12,340</span>
              </p>
              <p className="mb-2">
                This Month:{" "}
                <span className="font-bold text-gray-800">2,500</span>
              </p>
              <p className="mb-2">
                Pending Payments:{" "}
                <span className="font-bold text-red-500">500</span>
              </p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Target Progress</span>
                <span className="text-sm font-bold text-gray-800">70%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-green-500 h-2 rounded-full animate-progress"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>
            <button className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
              View Earnings Details
            </button>
          </div>
          {/* Patient Count Card */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 shadow-md rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-center space-x-4 mb-4">
              <FaUserFriends className="text-purple-500 text-3xl" />
              <h2 className="text-xl font-semibold text-gray-800">
                Patient Count
              </h2>
            </div>
            <div className="text-gray-600">
              <p className="mb-2">
                Total Patients:{" "}
                <span className="font-bold text-purple-500">120</span>
              </p>
              <p className="mb-2">
                New Patients:{" "}
                <span className="font-bold text-green-500">8</span>
              </p>
              <p className="mb-2">
                Active Patients:{" "}
                <span className="font-bold text-gray-800">100</span>
              </p>
            </div>
            <button className="mt-4 w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition">
              View Patient Details
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
