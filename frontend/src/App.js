import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './PatientComponents/Navbar';
import Footer from './PatientComponents/Footer';
import DoctorNavbar from './DoctorComponents/DoctorNavbar';
import Login from './authentication/Login';
import Signup from './authentication/Signup';
import { useAuth } from '../src/context/AuthContext';
import PatientRoutes from './routes/PatientRoutes';
import DoctorRoutes from './routes/DoctorRoutes';
import AdminRoutes from './routes/AdminRoutes';
import AdminNavbar from './AdminComponents/AdminNavbar';
import InfoPage from './PatientPages/InfoPage';
import PaymentRoutes from './routes/PaymentRoutes';

const App = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const isDoctorRoute = location.pathname.startsWith('/doctor/');
  const isAdminRoute = location.pathname.startsWith('/admin/');

  console.log('Current Path:', location.pathname);

  return (
    <div className="mx-4 sm:mx-[10%]">
      {isAdminRoute ? (
        user?.role === 'admin' ? (
          <AdminNavbar />
        ) : null
      ) : isDoctorRoute ? (
        user?.role === 'doctor' ? (
          <DoctorNavbar />
        ) : null
      ) : (
        <Navbar />
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup/:userType" element={<Signup />} />
        <Route path="/*" element={<PatientRoutes />} />
        <Route path="/doctor/*" element={<DoctorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} /> {/* Add Admin Routes */}
        <Route path="/payment/*" element={<PaymentRoutes />} />
        <Route path="/pharmacy/:id" element={<InfoPage />} />
        <Route path="/lab/:id" element={<InfoPage />} />
      </Routes>
      {!isAdminRoute && <Footer />} {/* Hide footer for admin pages if needed */}
    </div>
  );
};

export default App;
