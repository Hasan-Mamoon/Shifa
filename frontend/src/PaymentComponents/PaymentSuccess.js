import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    console.log("Extracted session ID:", sessionId); // ✅ Debugging
    
  
    if (!sessionId) {
      setMessage('Invalid payment session.');
      return;
    }
  
    verifyPayment(); // Call function to verify payment
  }, [sessionId]);
  
  const verifyPayment = async () => {
    try {
      console.log("Verifying payment for session:", sessionId); // ✅ Debugging
  
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/payment/verify?sessionId=${sessionId}`
      );
  
      const data = await response.json();
      console.log("Payment verification response:", data); // ✅ Debugging
  
      if (data.success) {
        setMessage('Payment successful! 🎉');
  
        // Now book the appointment
        bookAppointment(sessionId);
      } else {
        setMessage('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setMessage('Error verifying payment.');
    }
  };
  
  const bookAppointment = async (sessionId) => {
    try {
      console.log("📨 Sending request to book appointment for session:", sessionId); // ✅ Debugging
     
      const storedAppointmentData = JSON.parse(localStorage.getItem('appointmentData'));

      const appointmentResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/appointment/book-appointment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            doctorId: storedAppointmentData?.doctorId,
            patientId: storedAppointmentData?.patientId,
            slotId: storedAppointmentData?.slotId,
            date: storedAppointmentData?.date,
            time: storedAppointmentData?.time,
            type: storedAppointmentData?.type,
            meetingLink: storedAppointmentData?.meetingLink
          }),
        }
      );
      
      const appointmentData = await appointmentResponse.json();
      console.log("📩 Appointment API Response:", appointmentData); // ✅ Debugging
  
      if (appointmentData.success) {
        alert('✅ Appointment booked successfully!');
      } else {
        alert('⚠️ Payment succeeded, but appointment booking failed.');
      }
    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      alert('Error booking appointment.');
    }
  };
  
  return <h2>{message}</h2>;
};

export default PaymentSuccess;
