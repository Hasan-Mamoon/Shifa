import React, { useEffect, useState } from 'react';
import Layout from '../DoctorComponents/Layout';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const { user } = useAuth();
  const doctorId = user?.id;

  const [message, setMessage] = useState('');

  const apiCall = async (url, method, data = {}) => {
    try {
      const response = await axios({
        url,
        method,
        data,
        params: method === 'get' ? data : {},
      });
      return response.data;
    } catch (error) {
      console.error(`Error with ${method.toUpperCase()} ${url}:`, error);
      throw error;
    }
  };

  const fetchSlots = async () => {
    if (!date) {
      setSlots([]);
      return;
    }
    try {
      const data = await apiCall(`${process.env.REACT_APP_SERVER_URL}/slot/appointments`, 'get', {
        doctorId,
        date,
      });
      setSlots(data.length > 0 ? data : []);
    } catch (error) {
      setMessage('No slots available for this date');
      setSlots([]);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot) {
      setMessage('Please enter a valid time for the new slot.');
      return;
    }
    if (slots.some((slot) => slot.time === newSlot)) {
      setMessage('This slot is already added.');
      return;
    }
    try {
      await apiCall(`${process.env.REACT_APP_SERVER_URL}/slot/add`, 'post', {
        doctorId,
        date,
        slots: [...slots.map((slot) => slot.time), newSlot],
      });
      setMessage('New slot added successfully!');
      setNewSlot('');
      fetchSlots();
    } catch (error) {
      setMessage('Error adding new slot. Please try again.');
    }
  };

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  useEffect(() => {
    fetchSlots();
  }, [date]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-10 bg-gray-100 shadow-2xl rounded-xl">
        <h1 className="text-5xl font-bold text-gray-800 mb-8 text-center">Doctor Dashboard</h1>

        <div className="mb-10">
          <label htmlFor="date" className="block text-lg font-semibold text-gray-700">
            Select Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Available Slots</h2>
          {slots.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slots.map((slot, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
                    slot.isBooked
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  <span className="text-lg">{slot.time}</span>
                  <span className="text-sm">{slot.isBooked ? 'Booked' : 'Available'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No slots available for the selected date.</p>
          )}
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Add New Slot</h2>
          <form onSubmit={handleAddSlot} className="flex flex-wrap gap-4">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
            >
              Add Slot
            </button>
          </form>
        </div>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-center shadow-lg ${
              message.includes('success')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
