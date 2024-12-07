import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const Appointment = () => {
  const { docId } = useParams(); // Get the doctor ID from the URL
  const { doctors, currencySymbol } = useContext(AppContext); // Get doctors data and currency
  const [docInfo, setDocInfo] = useState(null); // Store doctor info
  const [availableDates, setAvailableDates] = useState([]); // Store available dates
  const [appointments, setAppointments] = useState([]); // Store appointments for selected date
  const [selectedDate, setSelectedDate] = useState(null); // Store the selected date

  // Fetch doctor info from the context or API
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const doc = doctors.find((doc) => doc._id === docId);
      setDocInfo(doc);
    };

    fetchDoctorInfo();
  }, [docId, doctors]);

  // Fetch all available dates for the doctor
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3080/slot/dates?doctorId=${docId}`
        );
        console.log("Available Dates:", response.data); // Log the data to verify
        setAvailableDates(response.data);
      } catch (error) {
        console.error("Error fetching available dates:", error);
      }
    };

    if (docId) {
      fetchAvailableDates();
    }
  }, [docId]);

  // Handle date click to fetch available slots for that date
  const handleDateClick = async (date) => {
    setSelectedDate(date); // Set selected date

    try {
      const response = await axios.get(
        `http://localhost:3080/slot/appointments?doctorId=${docId}&date=${date}`
      );
      console.log("Available Slots for Date:", response.data); // Log the data to verify
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  return (
    <div>
      {docInfo && (
        <div>
          <div className="doctor-info">
            <img src={docInfo.image} alt={docInfo.name} />
            <h2>{docInfo.name}</h2>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <p>{docInfo.about}</p>
            <p>Appointment fee: {currencySymbol} {docInfo.fees}</p>
          </div>

          {/* Available Dates Section */}
          <div className="available-dates">
            <h3>Available Dates</h3>
            <div className="dates-list">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateClick(date)}
                  className="date-button"
                >
                  {new Date(date).toLocaleDateString()}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments for the selected date */}
          {selectedDate && (
            <div className="appointments-list">
              <h3>Appointments for {new Date(selectedDate).toLocaleDateString()}</h3>
              <div className="appointments">
                {appointments.length > 0 ? (
                  appointments.map((slot) => (
                    <div key={slot._id} className="appointment">
                      <p>Time: {slot.time}</p>
                      <p>Status: {slot.isBooked ? "Booked" : "Available"}</p>
                    </div>
                  ))
                ) : (
                  <p>No appointments available for this date.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Appointment;