import React, { useEffect, useState } from "react";
import Layout from "../DoctorComponents/Layout";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  // Placeholder for fetching data from the backend
  useEffect(() => {
    const fetchAppointments = async () => {
      // This is a placeholder. Replace with actual API call
      const mockData = [
        {
          id: 1,
          patient: "Avinash Kr",
          age: 31,
          date: "5 Oct 2024, 12:00 PM",
          fees: 50,
          image:
            "https://img.fixthephoto.com/blog/images/gallery/news_image_11368.png", // Placeholder image
        },
        {
          id: 2,
          patient: "GreatStack",
          age: 24,
          date: "26 Sep 2024, 11:00 AM",
          fees: 40,
          image:
            "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500", // Placeholder image
        },
        {
          id: 3,
          patient: "GreatStack",
          age: 24,
          date: "23 Sep 2024, 01:00 PM",
          fees: 50,
          image:
            "https://preview.keenthemes.com/metronic-v4/theme/assets/pages/media/profile/people19.png", // Placeholder image
        },
        {
          id: 4,
          patient: "GreatStack",
          age: 24,
          date: "25 Sep 2024, 02:00 PM",
          fees: 40,
          image:
            "https://media.istockphoto.com/id/1317804578/photo/one-businesswoman-headshot-smiling-at-the-camera.jpg?s=612x612&w=0&k=20&c=EqR2Lffp4tkIYzpqYh8aYIPRr-gmZliRHRxcQC5yylY=", // Placeholder image
        },
        {
          id: 5,
          patient: "GreatStack",
          age: 24,
          date: "23 Sep 2024, 02:00 PM",
          fees: 40,
          image:
            "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg", // Placeholder image
        },
        {
          id: 6,
          patient: "GreatStack",
          age: 24,
          date: "22 Sep 2024, 06:00 PM",
          fees: 60,
          image:
            "https://cdn.prod.website-files.com/5e0e21dc3d017434b73b2cff/5ef710afc93f2ab8ed2923be_Linkedin_Profile_Example.jpg", // Placeholder image
        },
      ];
      setAppointments(mockData);
    };

    fetchAppointments();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-500 mb-6 border border-gray-400 rounded-full px-6 py-2 shadow-md">
          Appointments
        </h1>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left text-gray-600 px-6 py-3 text-sm font-semibold">
                  #
                </th>
                <th className="text-left text-gray-600 px-6 py-3 text-sm font-semibold">
                  Patient
                </th>
                <th className="text-left text-gray-600 px-6 py-3 text-sm font-semibold">
                  Age
                </th>
                <th className="text-left text-gray-600 px-6 py-3 text-sm font-semibold">
                  Date & Time
                </th>
                <th className="text-left text-gray-600 px-6 py-3 text-sm font-semibold">
                  Fees
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr
                  key={appointment.id}
                  className="border-b hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-6 py-3 text-sm text-gray-800">
                    {index + 1}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800 flex items-center space-x-4">
                    <img
                      src={appointment.image}
                      alt={appointment.patient}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span>{appointment.patient}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800">
                    {appointment.age}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800">
                    ${appointment.fees}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
