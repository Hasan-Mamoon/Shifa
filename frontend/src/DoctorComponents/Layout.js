import React from "react";
import Sidebar from "./DoctorSidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-grow p-6 bg-gray-100">
        {children}
      </main>
    </div>
  );
};

export default Layout;
