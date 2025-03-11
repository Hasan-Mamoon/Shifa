import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../PatientComponents/RelatedDoctors';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Checkout from "../PaymentComponents/Checkout";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const { user } = useAuth();

  const [availableDates, setAvailableDates] = useState([]);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [slotId, setSlotId] = useState('');
  const [appointmentType, setAppointmentType] = useState('virtual');

  const docInfo = doctors.find((doc) => doc._id === docId);

  const getAvailableDates = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/slot/dates?doctorId=${docId}`,
      );
      const datesFromDB = await response.json();
      if (response.ok) {
        setAvailableDates(datesFromDB);
      } else {
        toast.error('Error fetching available dates');
      }
    } catch (error) {
      toast.error('Error fetching available dates');
    }
  };

  const getAvailableSlots = async (date) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/slot/appointments?doctorId=${docId}&date=${date}`,
      );
      const slotsFromDB = await response.json();

      if (response.ok) {
        setDocSlots(
          slotsFromDB.map((slot) => ({
            id: slot._id,
            time: slot.time,
            isBooked: slot.isBooked,
          })),
        );
      } else {
        toast.error('Error fetching slots');
      }
    } catch (error) {
      toast.error('Error fetching slots');
    }
  };

  useEffect(() => {
    if (docInfo) {
      getAvailableDates();
    }
  }, [docInfo]);

  useEffect(() => {
    if (availableDates.length) {
      getAvailableSlots(availableDates[0]);
    }
  }, [availableDates]);

  const bookAppointment = async () => {
    if (!slotTime || !availableDates[slotIndex] || !slotId) {
      toast.warn('Please select a date and time slot before booking.');
      return;
    }

    const appointmentData = {
      doctorId: docId,
      patientId: user?.id,
      slotId,
      date: availableDates[slotIndex],
      time: slotTime,
      type: appointmentType,
      amount: docInfo.fees , // Convert to cents
      currency: "usd", // Ensure currency is provided
  };
  Checkout(appointmentData)
    

    if (appointmentType === 'virtual') {
      const jitsiMeetingId = `doctor-${docId}-patient-${user?.id}-${Date.now()}`;
      appointmentData.meetingLink = `https://meet.jit.si/${jitsiMeetingId}`;
    }

    try {
      const response = await fetch(
      
        `${process.env.REACT_APP_SERVER_URL}/appointment/book-appointment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData),
        },
        
      );

      const result = await response.json();
      if (response.ok) {
       
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  return (
    docInfo && (
      <div>
        <ToastContainer />
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img className="bg-primary w-full sm:max-w-72 rounded-lg" src={docInfo.image} alt="" />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{' '}
              <span className="text-gray-600">
                {currencySymbol} {docInfo.fees}
              </span>
            </p>
            <p>
            <span className="text-neutral-500">
              {docInfo.about}
              </span>
            </p>
          </div>
        </div>

        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Choose Appointment Type</p>
          <div className="flex gap-4 mt-2">
            <button
              className={`px-4 py-2 rounded ${appointmentType === 'virtual' ? 'bg-primary text-white' : 'border'}`}
              onClick={() => setAppointmentType('virtual')}
            >
              Virtual
            </button>
            <button
              className={`px-4 py-2 rounded ${appointmentType === 'physical' ? 'bg-primary text-white' : 'border'}`}
              onClick={() => setAppointmentType('physical')}
            >
              Physical
            </button>
          </div>

          <p className="mt-4">Booking Slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-auto mt-4">
            {availableDates.map((date, index) => (
              <div
                key={index}
                onClick={() => {
                  setSlotIndex(index);
                  getAvailableSlots(date);
                }}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'
                }`}
              >
                <p>{new Date(date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-auto mt-4">
            {docSlots.map((item) => (
              <p
                key={item.id}
                onClick={() => {
                  if (!item.isBooked) {
                    setSlotTime(item.time);
                    setSlotId(item.id);
                  }
                }}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer 
                  ${
                    item.isBooked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : item.time === slotTime
                        ? 'bg-primary text-white'
                        : 'text-gray-400 border border-gray-300'
                  }`}
              >
                {item.time.toLowerCase()}
              </p>
            ))}
          </div>

          <button
            className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
            onClick={bookAppointment}
          >
            Book an appointment
          </button>
        </div>
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;



