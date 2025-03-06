import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [imagePreview, setImagePreview] = useState(assets.profile_pic);
  const { setUser } = useAuth();
  const { user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3080/patient/${email}`
        );

        setUserData(response.data[0]);
        setImagePreview(response.data[0].image || assets.profile_pic);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [email]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setImagePreview(assets.profile_pic);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 max-h-23">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="w-44 cursor-pointer"
      />

      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1">Home</li>
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1">ALL DOCTORS</li>
        </NavLink>
        <NavLink to="/about">
          <li className="py-1">ABOUT</li>
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1">CONTACT</li>
        </NavLink>
        <NavLink to="/blogs">
          <li className="py-1">HEALTH-BLOGS</li>
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer group relative">
          <img className="w-8 rounded-full" src={imagePreview} alt="User" />
          <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown" />
          <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
            <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
              <p
                onClick={() => navigate("/my-profile")}
                className="hover:text-black cursor-pointer"
              >
                My Profile
              </p>
              <p
                onClick={() => navigate("/my-appointments")}
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

export default Navbar;
