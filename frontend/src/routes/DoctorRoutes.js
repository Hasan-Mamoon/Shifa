import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../DoctorPages/Dashboard";
import Appointments from "../DoctorPages/Appointments";
import Profile from "../DoctorPages/Profile";
import ProtectedRoute from "./ProtectedRoutes";


const DoctorRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <ProtectedRoute element={<Dashboard />} allowedRoles={["doctor"]} />
        }
      />
      <Route
        path="appointments"
        element={
          <ProtectedRoute
            element={<Appointments />}
            allowedRoles={["doctor"]}
          />
        }
      />
      <Route
        path="profile"
        element={
          <ProtectedRoute element={<Profile />} allowedRoles={["doctor"]} />
        }
      />
    </Routes>
  );
};

export default DoctorRoutes;
