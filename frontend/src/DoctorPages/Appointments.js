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
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-gray-100 rounded-lg shadow-lg">
      {docInfo && (
        <div>
          {/* Doctor Info */}
          <div className="doctor-info flex flex-col items-center text-center">
            <img
              src={docInfo.image}
              alt={docInfo.name}
              className="w-32 h-32 rounded-full object-cover shadow-md"
            />
            <h2 className="text-2xl font-semibold mt-4">{docInfo.name}</h2>
            <p className="text-gray-600">{docInfo.degree} - {docInfo.speciality}</p>
            <p className="text-gray-700 mt-2">{docInfo.about}</p>
            <p className="text-indigo-600 font-medium mt-2">
              Appointment Fee: {currencySymbol} {docInfo.fees}
            </p>
          </div>

          {/* Available Dates */}
          <div className="available-dates mt-8">
            <h3 className="text-xl font-semibold text-center">Available Dates</h3>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateClick(date)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  {new Date(date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments */}
          {selectedDate && (
            <div className="appointments mt-8">
              <h3 className="text-xl font-semibold text-center">
                Appointments for {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <div className="flex flex-col items-center gap-4 mt-4">
                {appointments.length > 0 ? (
                  appointments.map((slot) => (
                    <div
                      key={slot._id}
                      className={`p-4 w-full max-w-sm rounded-lg shadow-md ${
                        slot.isBooked ? "bg-red-200" : "bg-green-200"
                      }`}
                    >
                      <p className="text-gray-700">Time: {slot.time}</p>
                      <p className={`font-semibold ${slot.isBooked ? "text-red-600" : "text-green-600"}`}>
                        Status: {slot.isBooked ? "Booked" : "Available"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No appointments available for this date.</p>
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
