import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import Layout from '../DoctorComponents/Layout';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

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
  const [editableMedicalHistory, setEditableMedicalHistory] = useState(
    selectedPatient?.medicalHistory || '',
  );
  const [originalHistory, setOriginalHistory] = useState(editableMedicalHistory);
  const [filterType, setFilterType] = useState('future'); // 'past' or 'future'

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
          `${process.env.REACT_APP_SERVER_URL}/slot/dates?doctorId=${docId}`,
        );
        setAvailableDates(response.data);
      } catch (error) {
        console.error('Error fetching available dates:', error);
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
        `${process.env.REACT_APP_SERVER_URL}/slot/appointments?doctorId=${docId}&date=${date}`,
      );
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSlotClick = async (slot) => {
    if (slot.isBooked && slot.patient) {
      try {
        const patientResponse = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/patient/bid/${slot.patient}`,
        );
        setSelectedPatient(patientResponse.data);
        setEditableMedicalHistory(patientResponse.data.medicalHistory || '');
        setOriginalHistory(patientResponse.data.medicalHistory || '');

        const appointmentResponse = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/patient/details?slotId=${slot._id}&patientId=${slot.patient}`,
        );
        setSelectedAppointment(appointmentResponse.data);
      } catch (error) {
        console.error('Error fetching details:', error);
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
      toast.error('Failed to update medical history.');
    }
  };

  const filteredDates = availableDates.filter((date) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const appointmentDate = new Date(date).setHours(0, 0, 0, 0);
    return filterType === 'past' ? appointmentDate < today : appointmentDate >= today;
  });

  return (
    <Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
              <h2 className="text-2xl font-bold mt-4 text-gray-600">{docInfo.name}</h2>
              <p className="text-gray-500 mt-2">{docInfo.speciality}</p>
              <p className="text-gray-500 mt-2 text-sm">{docInfo.about}</p>
              <p className="text-primary font-semibold mt-4 text-lg">
                Appointment Fee: {currencySymbol}
                {docInfo.fees}
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                className={`py-2 px-4 rounded-lg shadow-md ${
                  filterType === 'past' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setFilterType('past');
                  setSelectedDate(null);
                  setSelectedPatient(null);
                  setSelectedAppointment(null);
                }}
              >
                Past Appointments
              </button>
              <button
                className={`py-2 px-4 rounded-lg shadow-md ${
                  filterType === 'future' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setFilterType('future');
                  setSelectedDate(null);
                  setSelectedPatient(null);
                  setSelectedAppointment(null);
                }}
              >
                Upcomming
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {filteredDates.length > 0 ? (
                filteredDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedPatient(null);
                      setSelectedAppointment(null);
                      handleDateClick(date);
                    }}
                    className={`py-3 px-4 rounded-lg shadow-lg transition-all ${
                      selectedDate === date
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-primary hover:text-white'
                    }`}
                  >
                    {new Date(date).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </button>
                ))
              ) : (
                <p className="text-gray-600 text-center col-span-full">
                  No available appointments.
                </p>
              )}
            </div>

            {selectedDate && (
              <div className="appointments mt-10">
                <h3 className="text-xl font-bold text-gray-800 text-center">
                  Appointments for {new Date(selectedDate).toLocaleDateString()}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {appointments.length > 0 ? (
                    appointments.map((slot) => (
                      <div
                        key={slot._id}
                        onClick={() => handleSlotClick(slot)}
                        className={`p-6 rounded-lg shadow-lg transition-all cursor-pointer ${
                          slot.isBooked
                            ? 'bg-red-100 border-red-400'
                            : 'bg-green-100 border-green-400'
                        } border-2`}
                      >
                        <p className="text-lg font-medium text-gray-700">Time: {slot.time}</p>
                        <p
                          className={`text-lg font-bold mt-2 ${
                            slot.isBooked ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {slot.isBooked ? 'Booked' : 'Available'}
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
            {/* Patient Details */}
            {selectedPatient && (
              <div className="patient-details mt-10 bg-gray-100 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-gray-800">Patient Details</h3>
                <p className="text-gray-600">Name: {selectedPatient.name}</p>
                <p className="text-gray-600">Email: {selectedPatient.email}</p>
                <p className="text-gray-600">Phone: {selectedPatient.phone}</p>
                <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Patient Medical History</h3>

                    {!isEditing && (
                      <button
                        onClick={handleEditClick}
                        className="text-gray-500 hover:text-gray-700 transition"
                      >
                        <PencilSquareIcon className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div>
                      <textarea
                        value={editableMedicalHistory}
                        onChange={handleMedicalHistoryChange}
                        className="w-full p-4 border rounded-lg bg-gray-50 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                        rows="5"
                      />
                      <button
                        onClick={saveMedicalHistory}
                        disabled={editableMedicalHistory === originalHistory}
                        className={`mt-4 w-full py-2 rounded-lg font-semibold transition-all ${
                          editableMedicalHistory !== originalHistory
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        Save Medical History
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600 bg-gray-100 p-3 rounded-md">
                      {editableMedicalHistory || 'No history available.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Appointment Details */}
            {selectedAppointment && (
              <div className="patient-details mt-10 bg-gray-100 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-gray-800">Appointment Details</h3>
                <p className="text-gray-600">
                  Type: {selectedAppointment.type === 'physical' ? 'Physical' : 'Virtual'}
                </p>
                {selectedAppointment.type === 'virtual' && selectedAppointment.meetingLink && (
                  <a
                    href={selectedAppointment.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointment;
