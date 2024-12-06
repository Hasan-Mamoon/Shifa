import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './hooks/useAuthContext'

// pages & components
import Navbar from './components/Navbar'
import Home from "./pages/Home"
import PatientHome from "./pages/PatientHome";
import DoctorHome from "./pages/DoctorHome";
import AdminHome from "./pages/AdminHome";
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminApproval from './pages/AdminApproval';


function App() {
  const {user} = useAuthContext()
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
        <Routes>
            {/* Public route - accessible to everyone */}
            <Route path="/" element={<Home />} />

            {/* Login route - only accessible if not logged in */}
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} 
            />

            {/* Signup route - only accessible if not logged in */}
            <Route 
              path="/signup" 
              element={!user ? <Signup /> : <Navigate to={`/${user.role}`} />} 
            />

            {/* Protected routes */}
            <Route 
              path="/patient" 
              element={user?.role === 'patient' ? <PatientHome /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/doctor" 
              element={user?.role === 'doctor' ? <DoctorHome /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminHome /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/approve" 
              element={user?.role === 'admin' ? <AdminApproval /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;