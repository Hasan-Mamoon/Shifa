import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <div className="md:mx-10 ">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            "Shifa - Your Trusted Partner in Health and Wellness" We’re committed to connecting you
            with qualified doctors and healthcare services to ensure your well-being is always a
            priority. Book appointments, access preventive health plans, and manage your medical
            needs seamlessly—all in one place.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li>Contact us</li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>f219418@cfd.nu.edu.pk</li>
            <li>f219414@cfd.nu.edu.pk</li>
            <li>f219444@cfd.nu.edu.pk</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">Copyright 2024 SHIFA - All Right Reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
