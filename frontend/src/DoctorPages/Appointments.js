import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import Layout from "../DoctorComponents/Layout";

const Appointment = () => {
  const { docId = "674cc15ca5aeceee59956c0a" } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const doc = doctors.find((doc) => doc._id === docId);
      setDocInfo(doc);
    };

    fetchDoctorInfo();
  }, [docId, doctors]);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3080/slot/dates?doctorId=${docId}`
        );
        setAvailableDates(response.data);
      } catch (error) {
        console.error("Error fetching available dates:", error);
      }
    };

    if (docId) {
      fetchAvailableDates();
    }
  }, [docId]);

  const handleDateClick = async (date) => {
    setSelectedDate(date);

    try {
      const response = await axios.get(
        `http://localhost:3080/slot/appointments?doctorId=${docId}&date=${date}`
      );
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        {docInfo && (
          <div>
            {/* Doctor Info */}
            <div className="doctor-info flex flex-col items-center text-center bg-gray-50 p-6 rounded-lg shadow-md">
              <img
                src={docInfo.image}
                alt={docInfo.name}
                className="w-32 h-32 rounded-full object-cover shadow-lg border-2 border-primary"
              />
              <h2 className="text-2xl font-bold mt-4 text-gray-600">
                {docInfo.name}
              </h2>
              <p className="text-gray-500 mt-2">
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <p className="text-gray-500 mt-2 text-sm">{docInfo.about}</p>
              <p className="text-primary font-semibold mt-4 text-lg">
                Appointment Fee: {currencySymbol}
                {docInfo.fees}
              </p>
            </div>

            {/* Available Dates */}
            <div className="available-dates mt-10">
              <h3 className="text-xl font-bold text-gray-800 text-center">
                Select an Appointment Date
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateClick(date)}
                    className={`py-3 px-4 text-center rounded-lg shadow-lg transition-all ${
                      selectedDate === date
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-primary hover:text-white"
                    }`}
                  >
                    {new Date(date).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </button>
                ))}
              </div>
            </div>

            {/* Appointments */}
            {selectedDate && (
              <div className="appointments mt-10">
                <h3 className="text-xl font-bold text-gray-800 text-center">
                  Appointments for{" "}
                  {new Date(selectedDate).toLocaleDateString()}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {appointments.length > 0 ? (
                    appointments.map((slot) => (
                      <div
                        key={slot._id}
                        className={`p-6 rounded-lg shadow-lg transition-all ${
                          slot.isBooked
                            ? "bg-red-100 border-red-400"
                            : "bg-green-100 border-green-400"
                        } border-2`}
                      >
                        <p className="text-lg font-medium text-gray-700">
                          Time: {slot.time}
                        </p>
                        <p
                          className={`text-lg font-bold mt-2 ${
                            slot.isBooked ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {slot.isBooked ? "Booked" : "Available"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center col-span-full">
                      No appointments available for this date.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointment;
