import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../PatientComponents/RelatedDoctors';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const { user } = useAuth();

  const [availableDates, setAvailableDates] = useState([]);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [slotId, setSlotId] = useState('');
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [appointmentType, setAppointmentType] = useState('virtual');

  const docInfo = doctors.find((doc) => doc._id === docId);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/doctor/${docId}/reviews`);
      const data = await response.json();
      if (response.ok) setReviews(data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitReview = async () => {
    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/doctor/${docId}/add-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, userId: user?.id }),
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        fetchReviews();
      } else {
        alert('Error submitting review.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  useEffect(() => {
    fetchDocInfo();
    fetchReviews();
  }, [doctors, docId]);

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
    };

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
        toast.success('Appointment booked successfully!');
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

            {/* Google Maps Button*/}
            {docInfo.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${docInfo.address.line1}, ${docInfo.address.line2}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline mt-2"
              >
                <img className="w-6 h-6" src={assets.GMAP} alt="Google Maps" />
                <span>View Location on Map</span>
              </a>
            )}

        {/* Review Section */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold">Patient Reviews</h3>

          {/* Display Average Rating */}
          <p className="mt-1 text-gray-600">
            Average Rating: {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'No ratings yet'}
          </p>

          {/* Star Rating Input */}
          {user && (
            <div className="mt-3">
              <p className="text-gray-700">Rate this doctor:</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`cursor-pointer text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <button className="mt-2 bg-primary text-white px-4 py-2 rounded" onClick={submitReview}>
                Submit Review
              </button>
            </div>
          )}
        </div>

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
