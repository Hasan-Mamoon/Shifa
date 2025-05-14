import React, { useEffect, useState } from 'react';
import Layout from '../DoctorComponents/Layout';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaUserMd, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [stats, setStats] = useState({ totalAppointments: 0, availableSlots: 0 });
  const { user } = useAuth();
  const doctorId = user?.id;
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const apiCall = async (url, method, data = {}) => {
    try {
      const response = await axios({
        url,
        method,
        data: method === 'post' ? data : {},
        params: method === 'get' ? data : {},
      });
      return response.data;
    } catch (error) {
      console.error(`Error with ${method.toUpperCase()} ${url}:`, error);
      throw error;
    }
  };

  const fetchSlots = async () => {
    if (!date || !doctorId) {
      setSlots([]);
      setStats({ totalAppointments: 0, availableSlots: 0 });
      return;
    }
    setLoading(true);
    try {
      const data = await apiCall(`${process.env.REACT_APP_SERVER_URL}/slot/appointments`, 'get', {
        doctorId,
        date,
      });

      if (data.length === 0) {
        setSlots([]);
        setStats({ totalAppointments: 0, availableSlots: 0 });
        setMessage('No slots available for this date');
        return;
      }

      const bookedSlots = data.filter((slot) => slot.isBooked).length;
      const availableSlots = data.filter((slot) => !slot.isBooked).length;

      setSlots(data);
      setStats({
        totalAppointments: bookedSlots,
        availableSlots: availableSlots,
      });
    } catch (error) {
      setMessage('No slots available for this date');
      setSlots([]);
      setStats({ totalAppointments: 0, availableSlots: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!doctorId) return;
    try {
      const data = await apiCall(`${process.env.REACT_APP_SERVER_URL}/stats`, 'get', { doctorId });
      setStats(data);
    } catch (error) {
      setMessage('Error fetching stats');
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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  useEffect(() => {
    if (doctorId) {
      fetchStats();
    }
  }, [doctorId]);

  useEffect(() => {
    fetchSlots();
  }, [date]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your appointments and schedule with ease. View your stats and add new slots for your patients.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-lg">
                <FaUserMd className="text-3xl" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium opacity-90">Total Appointments</p>
                <p className="text-3xl font-bold">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-lg">
                <FaCheckCircle className="text-3xl" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium opacity-90">Available Slots</p>
                <p className="text-3xl font-bold">{stats.availableSlots}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Date Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-12"
        >
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="text-2xl text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">Select Date</h2>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
        </motion.div>

        {/* Available Slots */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-12"
        >
          <div className="flex items-center mb-6">
            <FaClock className="text-2xl text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">Available Slots</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                    slot.isBooked
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">
                      {slot.time}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      slot.isBooked
                        ? 'bg-red-200 text-red-800'
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 italic">
              No slots available for the selected date.
            </p>
          )}
        </motion.div>

        {/* Add New Slot */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center mb-6">
            <FaClock className="text-2xl text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">Add New Slot</h2>
          </div>
          <form onSubmit={handleAddSlot} className="flex flex-wrap gap-4">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-4 bg-blue-600 text-white rounded-xl font-medium shadow-lg 
                transform transition-all duration-300 hover:shadow-xl hover:bg-blue-700 
                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Adding...' : 'Add Slot'}
            </button>
          </form>
        </motion.div>

        {/* Toast Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50"
          >
            <p className="text-gray-800">{message}</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
