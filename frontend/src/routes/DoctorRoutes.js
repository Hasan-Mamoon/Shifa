import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../DoctorPages/Dashboard';
import Appointments from '../DoctorPages/Appointments';
import Profile from '../DoctorPages/Profile';
import ProtectedRoute from './ProtectedRoutes';
import AddBlog from '../DoctorPages/AddBlog';
import DoctorBlogs from '../DoctorPages/DoctorBlogs';
import DoctorBlogDetails from '../DoctorPages/DoctorBlogDetails';

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<ProtectedRoute element={<Dashboard />} allowedRoles={['doctor']} />}
      />
      <Route
        path="appointments"
        element={<ProtectedRoute element={<Appointments />} allowedRoles={['doctor']} />}
      />
      <Route
        path="profile"
        element={<ProtectedRoute element={<Profile />} allowedRoles={['doctor']} />}
      />
      <Route
        path="/blogs/list"
        element={<ProtectedRoute element={<DoctorBlogs />} allowedRoles={['doctor']} />}
      />
      <Route
        path="/blogs/:id"
        element={<ProtectedRoute element={<DoctorBlogDetails />} allowedRoles={['doctor']} />}
      />
      <Route
        path="/blogs"
        element={<ProtectedRoute element={<AddBlog />} allowedRoles={['doctor']} />}
      />
    </Routes>
  );
};

export default DoctorRoutes;
