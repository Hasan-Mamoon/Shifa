import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoutes';
import PaymentSuccess from '../PaymentComponents/PaymentSuccess';
import Appointment from '../PatientPages/Appointment';

const PaymentRoutes = () => {
  return (
    <Routes>
      <Route
        path="payment/success"
        element={<ProtectedRoute element={<PaymentSuccess />} allowedRoles={['patient']} />}
      />
      <Route
        path="payment/failure"
        element={<ProtectedRoute element={<Appointment />} allowedRoles={['patient']} />}
      />
    </Routes>
  );
};

export default PaymentRoutes;
