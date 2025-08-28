import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Banner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row bg-primary rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 items-center overflow-hidden shadow-lg">
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5 text-center md:text-left animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Book an Appointment Instantly
        </h1>
        <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-200">
          Connect with 100+ trusted doctors & get expert medical advice.
        </p>

        {!user && (
          <div className="mt-6 space-y-4">
            <button
              onClick={() => {
                navigate('/signup/patient');
                window.scrollTo(0, 0);
              }}
              className="bg-white text-gray-700 text-lg font-semibold px-6 py-3 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
            >
              Create Account
            </button>
            <p className="text-gray-200 font-medium">or</p>
            <p className="text-gray-200 text-lg font-medium">
              Interested in providing services as a doctor? Register now!
            </p>
            <button
              onClick={() => {
                navigate('/signup/doctor');
                window.scrollTo(0, 0);
              }}
              className="bg-yellow-500 text-gray-700 text-lg font-semibold px-6 py-3 rounded-full shadow-md hover:scale-105 transition-transform duration-200"
            >
              Register as a Doctor
            </button>
          </div>
        )}
      </div>

      <div className="hidden md:block md:w-1/2 lg:w-[370px] relative animate-slideInRight">
        <img
          className="w-full max-w-md"
          src={assets.appointment_img}
          alt="Doctor and patient illustration"
        />
      </div>
    </div>
  );
};

export default Banner;
