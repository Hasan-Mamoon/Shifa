import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppointmentCard = ({ appointment, onCancel }) => {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = appointment.doctorId.image || '/path/to/default/image.jpg';
  
  const getStatusColor = () => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    if (appointmentDate < today) return 'bg-gray-100 border-gray-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getStatusText = () => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    if (appointmentDate > today) return 'Upcoming';
    return 'Previous';
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isHovered ? 'scale-[1.02] shadow-lg' : 'scale-100 shadow-sm'
      } ${getStatusColor()} rounded-xl border overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Doctor Image */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white">
              <img
                src={imageUrl}
                alt={appointment.doctorId.name}
                className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
              />
            </div>
            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium
  ${getStatusText() === 'Completed' ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'}`}>
  {getStatusText()}
</div>

          </div>

          {/* Appointment Details */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  Dr. {appointment.doctorId.name}
                </h3>
                <p className="text-blue-600 font-medium">{appointment.doctorId.speciality}</p>
              </div>
              <button
                className="text-sm font-medium px-4 py-2 rounded-lg border-2 border-red-500 text-red-500
                  hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={() => onCancel(appointment._id)}
              >
                Cancel
              </button>
            </div>

            {/* Appointment Info */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-base font-medium text-gray-900">{appointment.date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Time</p>
                <p className="text-base font-medium text-gray-900">{appointment.time}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Type</p>
                <div className="flex items-center gap-2">
                  {appointment.type === 'virtual' ? (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                  <span className="font-medium text-gray-900">
                    {appointment.type === 'virtual' ? 'Virtual Meeting' : 'In-Person Visit'}
                  </span>
                </div>
              </div>
            </div>

            {/* Meeting Link for Virtual Appointments */}
            {appointment.type === 'virtual' && appointment.meetingLink && (
              <div className="mt-4">
                <a
                  href={appointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg
                    hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
      if (response.ok) {
        setAppointments(data);
      } else {
        console.error('Error fetching appointments:', data.message);
        toast.error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
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
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel appointment');
      }

      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment._id !== appointmentId),
      );

      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
        <p className="text-gray-600 max-w-sm">
          You don't have any appointments scheduled. Book an appointment with one of our doctors to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Appointments</h2>
          <p className="text-gray-600 mt-1">Manage your upcoming and past appointments</p>
        </div>
        <div className="bg-blue-50 rounded-full px-4 py-2 text-blue-600 font-medium">
          {appointments.length} Appointment{appointments.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-6">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment._id}
            appointment={appointment}
            onCancel={handleCancelAppointment}
          />
        ))}
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default MyAppointments;
