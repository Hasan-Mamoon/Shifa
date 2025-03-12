import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoutes';
import AdminDashboard from '../AdminPages/AdminDashboard';
import ManageDoctors from '../AdminPages/ManageDoctors';
import AdminDiscounts from '../AdminPages/AdminDiscounts';

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
      <Route
        path="manage-discounts"
        element={<ProtectedRoute element={<AdminDiscounts />} allowedRoles={['admin']} />}
      />
    </Routes>
  );
};

export default AdminRoutes;
