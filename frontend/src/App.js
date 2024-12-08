import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./PatientPages/Home";
import Login from "./PatientPages/Login";
import Doctors from "./PatientPages/Doctors";
import MyAppointments from "./PatientPages/MyAppointments";
import Contact from "./PatientPages/Contact";
import About from "./PatientPages/About";
import MyProfile from "./PatientPages/MyProfile";
import Appointment from "./PatientPages/Appointment";
import Navbar from "./PatientComponents/Navbar";
import Footer from "./PatientComponents/Footer";





import DoctorNavbar from "./DoctorComponents/DoctorNavbar"
import DoctorSidebar from './DoctorComponents/DoctorSidebar'
import Dashboard from "./DoctorPages/Dashboard"
import Appointments from "./DoctorPages/Appointments";
import Profile from "./DoctorPages/Profile";






const App = () => {
  return (
     <div className="mx-4 sm:mx-[10%]">
     <Navbar />
     <Routes>
       <Route path="/" element={<Home />}></Route>
       <Route path="/doctors" element={<Doctors />}></Route>
       <Route path="/doctors/:speciality" element={<Doctors />}></Route>
       <Route path="/login" element={<Login />}></Route>
       <Route path="/about" element={<About />}></Route>
       <Route path="/contact" element={<Contact />}></Route>
       <Route path="/my-profile" element={<MyProfile />}></Route>
       <Route path="/my-appointments" element={<MyAppointments />}></Route>
       <Route path="/appointment/:docId" element={<Appointment />}></Route>
      </Routes>

     <Footer />




      {/* <DoctorNavbar/>
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/docAppointments" element={<Appointments />} />
        <Route path="/docProfile" element={<Profile />} />
      </Routes>   */}



      
    </div>
  );
};

export default App;
