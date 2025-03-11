import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../PatientPages/Home';
import Doctors from '../PatientPages/Doctors';
import MyAppointments from '../PatientPages/MyAppointments';
import Contact from '../PatientPages/Contact';
import About from '../PatientPages/About';
import MyProfile from '../PatientPages/MyProfile';
import Appointment from '../PatientPages/Appointment';
import ProtectedRoute from './ProtectedRoutes';
import HealthBlogs from '../PatientPages/HealthBlogs';
import BlogDetails from '../PatientPages/BlogDetails';
const PatientRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="doctors" element={<Doctors />} />
      <Route path="doctors/:speciality" element={<Doctors />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="/blogs" element={<HealthBlogs />} />
      <Route
        path="my-profile"
        element={<ProtectedRoute element={<MyProfile />} allowedRoles={['patient']} />}
      />
      <Route
        path="my-appointments"
        element={<ProtectedRoute element={<MyAppointments />} allowedRoles={['patient']} />}
      />
      <Route
        path="appointment/:docId"
        element={<ProtectedRoute element={<Appointment />} allowedRoles={['patient']} />}
      />

      <Route
        path="/blog/:id"
        element={<ProtectedRoute element={<BlogDetails />} allowedRoles={['patient']} />}
      />
    </Routes>
  );
};

export default PatientRoutes;
