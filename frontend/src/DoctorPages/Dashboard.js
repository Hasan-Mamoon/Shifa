import React, { useEffect, useState } from "react";
import Layout from "../DoctorComponents/Layout";
import axios from "axios";

const Dashboard = () => {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [newSlot, setNewSlot] = useState("");
  const [updateSlot, setUpdateSlot] = useState({ oldTime: "", newTime: "" });
  const [doctorId] = useState("674cc15ca5aeceee59956c0a"); // Replace with actual doctor ID
  const [message, setMessage] = useState("");

  // Fetch all slots for the doctor
  const fetchSlots = async () => {
    if (!date) return;
    try {
      const response = await axios.get(`http://localhost:3080/slot/all?doctorId=${doctorId}&date=${date}`);
      setSlots(response.data);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  // Handle adding a new slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3080/slot/add", {
        doctorId,
        date,
        slots: [newSlot],
      });
      setMessage("New slot added successfully!");
      fetchSlots(); // Refresh slots after adding
      setNewSlot("");
    } catch (error) {
      console.error("Error adding slot:", error);
      setMessage("Error adding slot");
    }
  };

  // Handle updating an existing slot
  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:3080/slot/update", {
        doctorId,
        date,
        oldTime: updateSlot.oldTime,
        newTime: updateSlot.newTime,
      });
      setMessage("Slot updated successfully!");
      fetchSlots(); // Refresh slots after updating
      setUpdateSlot({ oldTime: "", newTime: "" });
    } catch (error) {
      console.error("Error updating slot:", error);
      setMessage("Error updating slot");
    }
  };

  useEffect(() => {
    fetchSlots(); // Fetch slots whenever date changes
  }, [date]);

  return (
    <Layout>
      <div className="p-6 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-500 mb-6">Dashboard</h1>

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

        <div className="mt-6">
          <h2 className="text-xl font-semibold">Update Existing Slot</h2>
          <form onSubmit={handleUpdateSlot} className="flex flex-col gap-4 mt-4">
            <input
              type="time"
              placeholder="Old Slot Time"
              value={updateSlot.oldTime}
              onChange={(e) => setUpdateSlot({ ...updateSlot, oldTime: e.target.value })}
              className="border border-gray-300 p-2 rounded"
              required
            />
            <input
              type="time"
              placeholder="New Slot Time"
              value={updateSlot.newTime}
              onChange={(e) => setUpdateSlot({ ...updateSlot, newTime: e.target.value })}
              className="border border-gray-300 p-2 rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Slot
            </button>
          </form>
        </div>

        {message && <p className="text-green-500 mt-4">{message}</p>}
      </div>
    </Layout>
  );
};

export default Dashboard;
