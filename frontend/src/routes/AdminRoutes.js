import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoutes';
import AdminDashboard from '../AdminPages/AdminDashboard';
import ManageDoctors from '../AdminPages/ManageDoctors';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />}
      />
      <Route
        path="manage-doctors"
        element={<ProtectedRoute element={<ManageDoctors />} allowedRoles={['admin']} />}
      />
    </Routes>
  );
};

export default AdminRoutes;
