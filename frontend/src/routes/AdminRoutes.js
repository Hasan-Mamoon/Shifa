import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoutes';
import AdminDashboard from '../AdminPages/AdminDashboard';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />}
      />
    </Routes>
  );
};

export default AdminRoutes;
