

import React, { useEffect, useState } from "react";

const MyAppointments = ({ userId='675033864d1158e5c2b3e4e0' }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:3080/appointment/appointments?userId=${userId}`);
      const data = await response.json();

      console.log("appoint: ", data)

      if (!response.ok) {
        console.error("Error fetching appointments:", data.message);
        return;
      }

      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchAppointments();
  }, [userId]);

  if (loading) {
    return <p>Loading appointments...</p>;
  }

  if (appointments.length === 0) {
    return <p>No appointments found.</p>;
  }

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      <div>
        {appointments.map((appointment) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={appointment._id}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={appointment.doctorId.image}
                alt={appointment.doctorId.name}
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutal-800 font-semibold">{appointment.doctorId.name}</p>
              <p>{appointment.doctorId.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{appointment.doctorId.address?.line1}</p>
              <p className="text-xs">{appointment.doctorId.address?.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-netural-700 font-medium">
                  Date & Time:
                </span>{" "}
                {appointment.date} at {appointment.time}
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                Pay Online
              </button>
              <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">
                Cancel Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
