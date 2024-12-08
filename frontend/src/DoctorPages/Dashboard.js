import React, { useEffect, useState } from "react";
import Layout from "../DoctorComponents/Layout";
import axios from "axios";

const Dashboard = () => {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [doctorId] = useState("674cc15ca5aeceee59956c0a"); // Replace with actual doctor ID
  const [message, setMessage] = useState("");

  // Helper function for API calls
  const apiCall = async (url, method, data = {}) => {
    try {
      const response = await axios({
        url,
        method,
        data,
        params: method === "get" ? data : {},
      });
      return response.data;
    } catch (error) {
      console.error(`Error with ${method.toUpperCase()} ${url}:`, error);
      throw error;
    }
  };

// Fetch slots for the selected date
const fetchSlots = async () => {
  if (!date) {
    setSlots([]); // Clear slots if no date is selected
    return;
  }
  try {
    const data = await apiCall(
      "http://localhost:3080/slot/appointments",
      "get",
      { doctorId, date }
    );

    // Update slots; if no data is available, set an empty array
    setSlots(data.length > 0 ? data : []);
  } catch (error) {
    setMessage("No slots available for this date");
    setSlots([]); // Clear slots on error
  }
};

  // Add a new slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot) {
      setMessage("Please enter a valid time for the new slot.");
      return;
    }
    if (slots.some((slot) => slot.time === newSlot)) {
      setMessage("This slot is already added.");
      return;
    }
    try {
      await apiCall("http://localhost:3080/slot/add", "post", {
        doctorId,
        date,
        slots: [...slots.map((slot) => slot.time), newSlot],
      });
      setMessage("New slot added successfully!");
      setNewSlot("");
      fetchSlots(); // Refresh slots after addition
    } catch (error) {
      setMessage("Error adding new slot. Please try again.");
    }
  };

  // Clear message after a few seconds
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  // Fetch slots whenever the date changes
  useEffect(() => {
    fetchSlots();
  }, [date]);

  return (
    <Layout>
      <div className="p-6 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-500 mb-6">Dashboard</h1>

        {/* Date Selection */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Select Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full mb-4"
          />
        </div>

        {/* Available Slots */}
        <div>
          <h2 className="text-xl font-semibold">Available Slots</h2>
          {slots.length > 0 ? (
            <ul className="mt-4">
              {slots.map((slot, index) => (
                <li key={index} className="flex justify-between py-2">
                  <span>{slot.time}</span>
                  <span>{slot.isBooked ? "Booked" : "Available"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4">No slots available for the selected date.</p>
          )}
        </div>

        {/* Add Slot */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Add New Slot</h2>
          <form onSubmit={handleAddSlot} className="flex flex-col gap-4 mt-4">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="border border-gray-300 p-2 rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Slot
            </button>
          </form>
        </div>

        {/* User Feedback */}
        {message && <p className="text-green-500 mt-4">{message}</p>}
      </div>
    </Layout>
  );
};

export default Dashboard;
