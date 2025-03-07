import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;
  console.log(userId);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/appointment/appointments?userId=${userId}`
      );
      const data = await response.json();

      console.log("appointments: ", data);

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
    if (userId) {
      fetchAppointments();
    }
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
        {appointments.map((appointment) => {
          const imageUrl = appointment.doctorId.image || "";

          const maxImageUrlLength = 1024;
          const finalImageUrl =
            imageUrl && imageUrl.length <= maxImageUrlLength
              ? imageUrl
              : "/path/to/default/image.jpg";

          return (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={appointment._id}
            >
              <div>
                <img
                  src={finalImageUrl}
                  alt={appointment.doctorId.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                  }}
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {appointment.doctorId.name}
                </p>
                <p>{appointment.doctorId.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{appointment.doctorId.address?.line1}</p>
                <p className="text-xs">{appointment.doctorId.address?.line2}</p>
                <p className="text-zinc-700 font-medium mt-1">Time & Date:</p>
                <p className="text-xs">{appointment.date}</p>
                <p className="text-xs">{appointment.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;
