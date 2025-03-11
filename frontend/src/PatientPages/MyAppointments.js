import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/appointment/appointments?userId=${userId}`,
      );
      const data = await response.json();
console.log (data)
      if (response.ok) {
        setAppointments(data);
      } else {
        console.error('Error fetching appointments:', data.message);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId]);

  const handleCancelAppointment = async (appointmentId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmCancel) return;
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/appointment/${appointmentId}`,
        {
          method: 'DELETE', // Use DELETE method instead of PATCH for deleting the appointment
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel appointment');
      }
  
      // Remove the appointment from the state after successful deletion
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment._id !== appointmentId)
      );
  
      toast.success('Appointment cancelled and deleted successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment. Please try again.');
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500">Loading appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-500">No appointments found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">My Appointments</h2>
      <div className="space-y-4">
        
      {appointments.map((appointment) => {
         const imageUrl = appointment.doctorId.image || '/path/to/default/image.jpg';
          return (
            
            <div
              key={appointment._id}
              className="flex items-center gap-4 p-4 border rounded-lg shadow-sm bg-white"
            >
              
              <img
                src={imageUrl}
                alt={appointment.doctorId.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">{appointment.doctorId.name}</p>
                <p className="text-sm text-gray-600">{appointment.doctorId.speciality}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Meeting Type:</strong>{' '}
                  {appointment.type === 'virtual' ? 'Virtual' : 'Physical'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Time & Date:</strong> {appointment.date} at {appointment.time}
                </p>

                {appointment.type === 'virtual' && appointment.meetingLink && (
                  <p className="text-xs text-blue-600 mt-1">
                    <strong>Meeting Link:</strong>{' '}
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800"
                    >
                      Join Meeting
                    </a>
                  </p>
                )}
              </div>
              <button
                className="text-xs text-red-600 border border-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition"
                onClick={() => handleCancelAppointment(appointment._id)}
              >
                Cancel
              </button>
            </div>
          );
        })}
      </div>

      {/* Toast Container to display notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default MyAppointments;
