// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   useLocation,
// } from "react-router-dom";
// import Navbar from "./PatientComponents/Navbar";
// import Footer from "./PatientComponents/Footer";
// import DoctorNavbar from "./DoctorComponents/DoctorNavbar";
// import Login from "./authentication/Login";
// import Signup from "./authentication/Signup";
// import { useAuth } from "../src/context/AuthContext";
// import PatientRoutes from "./routes/PatientRoutes";
// import DoctorRoutes from "./routes/DoctorRoutes";

// const App = () => {
//   const location = useLocation();
//   const { user } = useAuth();

//   const hideNavbarFooter = ["/login", "/signup"].includes(location.pathname);

//   const isDoctorRoute = location.pathname.startsWith("/doctor/");

//   return (
//     <div className="mx-4 sm:mx-[10%]">
//       {!hideNavbarFooter &&
//         (isDoctorRoute ? (
//           user?.role === "doctor" ? (
//             <DoctorNavbar />
//           ) : null
//         ) : (
//           <Navbar />
//         ))}

//       <Routes>
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />

//         <Route path="/*" element={<PatientRoutes />} />

//         <Route path="/doctor/*" element={<DoctorRoutes />} />
//       </Routes>

//       {!hideNavbarFooter && !isDoctorRoute && <Footer />}
//     </div>
//   );
// };

// export default App;











import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./PatientComponents/Navbar";
import Footer from "./PatientComponents/Footer";
import DoctorNavbar from "./DoctorComponents/DoctorNavbar";
import Login from "./authentication/Login";
import Signup from "./authentication/Signup";
import { useAuth } from "../src/context/AuthContext";
import PatientRoutes from "./routes/PatientRoutes";
import DoctorRoutes from "./routes/DoctorRoutes";

const App = () => {
  const location = useLocation();
  const { user, loading } = useAuth(); 

  if (loading) return <div>Loading...</div>; 

  const hideNavbarFooter = ["/login", "/signup"].includes(location.pathname);
  const isDoctorRoute = location.pathname.startsWith("/doctor/");

  return (
    <div className="mx-4 sm:mx-[10%]">
      {!hideNavbarFooter &&
        (isDoctorRoute ? (
          user?.role === "doctor" ? (
            <DoctorNavbar />
          ) : null
        ) : (
          <Navbar />
        ))}

      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PatientRoutes />} />
        <Route path="/doctor/*" element={<DoctorRoutes />} />
      </Routes>

      {!hideNavbarFooter && !isDoctorRoute && <Footer />}
    </div>
  );
};

export default App;
