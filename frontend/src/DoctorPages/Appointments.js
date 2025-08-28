import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import Layout from '../DoctorComponents/Layout';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilSquareIcon, CalendarIcon, ClockIcon, UserIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.3
    }
  }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: -20,
    transition: {
      duration: 0.2
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center justify-center p-4"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </motion.div>
);

// Appointment Card Component
const AppointmentCard = ({ slot, onClick, isSelected }) => (
  <motion.div
    variants={cardVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    whileHover="hover"
    whileTap="tap"
    onClick={onClick}
    layout
    className={`p-6 rounded-xl shadow-lg transition-all cursor-pointer transform 
      ${slot.isBooked 
        ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
        : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
      } border-2 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
  >
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex items-center space-x-3"
    >
      <ClockIcon className="h-5 w-5 text-gray-500" />
      <p className="text-lg font-medium text-gray-700">{slot.time}</p>
    </motion.div>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex items-center space-x-2 mt-3"
    >
      {slot.isBooked ? (
        <UserIcon className="h-5 w-5 text-red-500" />
      ) : (
        <CalendarIcon className="h-5 w-5 text-green-500" />
      )}
      <p className={`text-lg font-bold ${slot.isBooked ? 'text-red-600' : 'text-green-600'}`}>
        {slot.isBooked ? 'Booked' : 'Available'}
      </p>
    </motion.div>
  </motion.div>
);

const Appointment = () => {
  const { user } = useAuth();
  const { docId = user?.id } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const [docInfo, setDocInfo] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableMedicalHistory, setEditableMedicalHistory] = useState('');
  const [originalHistory, setOriginalHistory] = useState('');
  const [filterType, setFilterType] = useState('future');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        setIsLoading(true);
        const doc = doctors.find((doc) => doc._id === docId);
        setDocInfo(doc);
      } catch (error) {
        console.error('Error fetching doctor info:', error);
        toast.error('Failed to fetch doctor information');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorInfo();
  }, [docId, doctors]);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/slot/dates?doctorId=${docId}`,
        );
        setAvailableDates(response.data);
      } catch (error) {
        console.error('Error fetching available dates:', error);
        toast.error('Failed to fetch available dates');
      }
    };

    if (docId) {
      fetchAvailableDates();
    }
  }, [docId]);

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    try {
      setIsLoadingAppointments(true);
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/slot/appointments?doctorId=${docId}&date=${date}`,
      );
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const handleSlotClick = async (slot) => {
    if (slot.isBooked && slot.patient) {
      try {
        const [patientResponse, appointmentResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_SERVER_URL}/patient/bid/${slot.patient}`),
          axios.get(
            `${process.env.REACT_APP_SERVER_URL}/patient/details?slotId=${slot._id}&patientId=${slot.patient}`,
          ),
        ]);

        setSelectedPatient(patientResponse.data);
        setEditableMedicalHistory(patientResponse.data.medicalHistory || '');
        setOriginalHistory(patientResponse.data.medicalHistory || '');
        setSelectedAppointment(appointmentResponse.data);
        
        // Scroll to patient details smoothly
        const patientDetailsElement = document.querySelector('.patient-details');
        if (patientDetailsElement) {
          patientDetailsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (error) {
        console.error('Error fetching details:', error);
        toast.error('Failed to fetch patient details');
      }
    } else {
      setSelectedPatient(null);
      setSelectedAppointment(null);
      setEditableMedicalHistory('');
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleMedicalHistoryChange = (e) => {
    setEditableMedicalHistory(e.target.value);
  };

  const saveMedicalHistory = async () => {
    if (editableMedicalHistory === originalHistory) return;

    try {
      await axios.put(`${process.env.REACT_APP_SERVER_URL}/patient/update/${selectedPatient._id}`, {
        medicalHistory: editableMedicalHistory,
      });

      toast.success('Medical history updated successfully!');
      setOriginalHistory(editableMedicalHistory);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating medical history:', error);
      toast.error('Failed to update medical history');
    }
  };

  const filteredDates = availableDates.filter((date) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const appointmentDate = new Date(date).setHours(0, 0, 0, 0);
    return filterType === 'past' ? appointmentDate < today : appointmentDate >= today;
  });

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="w-full mx-auto  "
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingSpinner key="spinner" />
          ) : docInfo ? (
            <motion.div 
              key="content"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
            >
              {/* Doctor Info Card */}
              <motion.div 
                variants={fadeInUp}
                className="doctor-info bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-xl"
                layout
              >
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  <div className="relative group">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      src={docInfo.image}
                      alt={docInfo.name}
                      className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-white"
                    />
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                  </div>
                  <motion.div 
                    variants={fadeInUp}
                    className="flex-1 text-center md:text-left"
                  >
                    <h2 className="text-3xl font-bold text-gray-800">{docInfo.name}</h2>
                    <p className="text-xl text-primary mt-2">{docInfo.speciality}</p>
                    <p className="text-gray-600 mt-3 max-w-2xl">{docInfo.about}</p>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-primary/10 rounded-full"
                    >
                      <span className="text-primary font-semibold">
                        Appointment Fee: {currencySymbol}{docInfo.fees}
                      </span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Filter Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex justify-center gap-4 mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`py-3 px-6 rounded-xl shadow-md transition-all duration-300 ${
                    filterType === 'past'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setFilterType('past');
                    setSelectedDate(null);
                    setSelectedPatient(null);
                    setSelectedAppointment(null);
                  }}
                >
                  Past Appointments
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`py-3 px-6 rounded-xl shadow-md transition-all duration-300 ${
                    filterType === 'future'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setFilterType('future');
                    setSelectedDate(null);
                    setSelectedPatient(null);
                    setSelectedAppointment(null);
                  }}
                >
                  Upcoming Appointments
                </motion.button>
              </motion.div>

              {/* Date Selection */}
              <motion.div 
                variants={fadeInUp}
                layout
                className="mt-8 bg-white p-6 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-6">Select Date</h3>
                <motion.div 
                  variants={staggerContainer}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  <AnimatePresence mode="wait">
                    {filteredDates.length > 0 ? (
                      filteredDates.map((date) => (
                        <motion.button
                          key={date}
                          variants={cardVariants}
                          onClick={() => {
                            setSelectedPatient(null);
                            setSelectedAppointment(null);
                            handleDateClick(date);
                          }}
                          className={`py-4 px-6 rounded-xl shadow-md transition-all duration-300 ${
                            selectedDate === date
                              ? 'bg-primary text-white'
                              : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          <CalendarIcon className="h-5 w-5 mx-auto mb-2" />
                          {format(new Date(date), 'MMM dd, yyyy')}
                        </motion.button>
                      ))
                    ) : (
                      <motion.p
                        variants={fadeInUp}
                        className="text-gray-600 text-center col-span-full py-8"
                      >
                        No available appointments.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Appointments Grid */}
              {selectedDate && (
                <motion.div
                  variants={fadeInUp}
                  className="mt-8 bg-white p-6 rounded-2xl shadow-lg"
                  layout
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    Appointments for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
                  </h3>
                  <AnimatePresence mode="wait">
                    {isLoadingAppointments ? (
                      <LoadingSpinner key="loading" />
                    ) : (
                      <motion.div 
                        key="appointments"
                        variants={staggerContainer}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      >
                        <AnimatePresence>
                          {appointments.length > 0 ? (
                            appointments.map((slot) => (
                              <AppointmentCard
                                key={slot._id}
                                slot={slot}
                                onClick={() => handleSlotClick(slot)}
                                isSelected={selectedAppointment?._id === slot._id}
                              />
                            ))
                          ) : (
                            <motion.p
                              key="no-appointments"
                              variants={fadeInUp}
                              className="text-gray-600 text-center col-span-full py-8"
                            >
                              No appointments available for this date.
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Patient Details */}
              <AnimatePresence mode="wait">
                {selectedPatient && (
                  <motion.div
                    key="patient-details"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="mt-8 bg-white p-6 rounded-2xl shadow-lg patient-details"
                    layout
                  >
                    <div className="space-y-6">
                      <motion.div variants={fadeInUp}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Patient Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <motion.div 
                            variants={cardVariants}
                            className="p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center space-x-3">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                              <p className="text-gray-600">
                                <span className="font-medium">Name:</span> {selectedPatient.name}
                              </p>
                            </div>
                          </motion.div>
                          <motion.div 
                            variants={cardVariants}
                            className="p-4 bg-gray-50 rounded-xl"
                          >
                            <p className="text-gray-600">
                              <span className="font-medium">Email:</span> {selectedPatient.email}
                            </p>
                          </motion.div>
                          <motion.div 
                            variants={cardVariants}
                            className="p-4 bg-gray-50 rounded-xl"
                          >
                            <p className="text-gray-600">
                              <span className="font-medium">Phone:</span> {selectedPatient.phone}
                            </p>
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Medical History Section */}
                      <motion.div 
                        variants={fadeInUp}
                        className="bg-gray-50 p-6 rounded-xl"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold text-gray-800">Medical History</h3>
                          {!isEditing && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              onClick={handleEditClick}
                              className="text-primary hover:text-primary-dark transition-colors"
                            >
                              <PencilSquareIcon className="w-6 h-6" />
                            </motion.button>
                          )}
                        </div>

                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div
                              key="edit"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                              <textarea
                                value={editableMedicalHistory}
                                onChange={handleMedicalHistoryChange}
                                className="w-full p-4 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                rows="5"
                                placeholder="Enter patient's medical history..."
                              />
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                onClick={saveMedicalHistory}
                                disabled={editableMedicalHistory === originalHistory}
                                className={`mt-4 w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                                  editableMedicalHistory !== originalHistory
                                    ? 'bg-primary text-white hover:bg-primary-dark'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                Save Medical History
                              </motion.button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="view"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="bg-white p-4 rounded-xl shadow-sm"
                            >
                              <p className="text-gray-600 whitespace-pre-wrap">
                                {editableMedicalHistory || 'No medical history available.'}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Appointment Details */}
              <AnimatePresence mode="wait">
                {selectedAppointment && (
                  <motion.div
                    key="appointment-details"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="mt-8 bg-white p-6 rounded-2xl shadow-lg"
                    layout
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div 
                        variants={cardVariants}
                        className="p-4 bg-gray-50 rounded-xl flex items-center space-x-3"
                      >
                        {selectedAppointment.type === 'virtual' ? (
                          <VideoCameraIcon className="h-5 w-5 text-primary" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-primary" />
                        )}
                        <p className="text-gray-600">
                          <span className="font-medium">Type:</span>{' '}
                          {selectedAppointment.type === 'physical' ? 'Physical' : 'Virtual'}
                        </p>
                      </motion.div>
                      
                      {selectedAppointment.type === 'virtual' && selectedAppointment.meetingLink && (
                        <motion.a
                          variants={cardVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={selectedAppointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 bg-primary text-white rounded-xl flex items-center justify-center space-x-2 hover:bg-primary-dark transition-colors duration-300"
                        >
                          <VideoCameraIcon className="h-5 w-5" />
                          <span>Join Meeting</span>
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              variants={fadeInUp}
              className="text-center py-12"
            >
              <p className="text-xl text-red-500 font-medium">Doctor data not found.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
};

export default Appointment;
