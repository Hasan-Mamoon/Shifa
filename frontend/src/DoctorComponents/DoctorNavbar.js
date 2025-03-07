// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { assets } from "../assets/assets";
// import { useAuth } from "../context/AuthContext";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const { setUser } = useAuth();
//   const handleLogout = () => {
//     localStorage.clear();
//     setUser(null);
//     navigate("/");
//   };
//   return (
//     <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
//       <div className="flex items-center">
//         <img src={assets.logo} alt="" className="w-44 cursor-pointer" />
//         <p className="ml-2 text-gray-500 border border-gray-300 rounded-full px-2 py-1 text-sm">
//           Doctor
//         </p>
//       </div>

//       <div className="flex items-center space-x-4">
//         <button
//           onClick={handleLogout}
//           className="bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-600"
//         >
//           Logout
//         </button>
//       </div>
//     </header>
//   );
// };

// export default Navbar;




import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AiOutlineUser, AiOutlineHome, AiOutlineCalendar } from "react-icons/ai";

const DoctorNavbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [imagePreview, setImagePreview] = useState(assets.profile_pic);
  const { setUser, user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!email) return;
  
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/doctor/get-doctor?email=${email}`
        );
  
        if (response.data && response.data.length > 0) {
          setDoctorData(response.data[0]);
  
          // Set profile image from S3 signed URL
          setImagePreview(response.data[0]?.image || assets.profile_pic);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };
  
    fetchDoctorData();
  }, [email]);
  

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setImagePreview(assets.profile_pic);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 max-h-23">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="w-44 cursor-pointer"
      />

      {/* Navigation Links */}
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/doctor/dashboard">
          <li className="py-1 flex items-center gap-2">
             Dashboard
          </li>
        </NavLink>
     

        <NavLink to="/doctor/blogs">
          <li className="py-1 flex items-center gap-2">
             Add-Blogs
          </li>
        </NavLink>

        <NavLink to="/doctor/blogs/list">
          <li className="py-1 flex items-center gap-2">
             All-Blogs
          </li>
        </NavLink>
      </ul>

      {/* Profile & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer group relative">
          <img className="w-9 h-9 rounded-full" src={imagePreview} alt="Doctor" />
          <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown" />
          <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
            <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
              <p
                onClick={() => navigate("/doctor/profile")}
                className="hover:text-black cursor-pointer"
              >
                My Profile
              </p>
              <p
                onClick={() => navigate("/doctor/appointments")}
                className="hover:text-black cursor-pointer"
              >
                My Appointments
              </p>
              <p
                onClick={handleLogout}
                className="hover:text-black cursor-pointer p-2"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="Menu"
        />
      </div>
    </div>
  );
};

export default DoctorNavbar;
