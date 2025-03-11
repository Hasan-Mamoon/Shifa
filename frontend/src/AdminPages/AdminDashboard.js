import React, { useEffect, useState } from 'react';
import { FaUserMd, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ doctorCount: 0, patientCount: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/admin/count`);
        setCounts(response.data);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white p-6 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav>
          <ul className="space-y-4">
            <li
              className="flex items-center gap-3 cursor-pointer hover:text-gray-200"
              onClick={() => navigate('/admin/manage-doctors')}
            >
              <FaUserMd /> Manage Doctors
            </li>

            <li
              className="flex items-center gap-3 cursor-pointer hover:text-gray-200 mt-6"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Logout
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome, Admin!</p>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <FaUserMd className="text-4xl text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold">Doctors</h3>
              <p className="text-gray-500">{counts.doctorCount} Registered</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <FaUser className="text-4xl text-green-600" />
            <div>
              <h3 className="text-xl font-semibold">Users</h3>
              <p className="text-gray-500">{counts.patientCount} Active</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
