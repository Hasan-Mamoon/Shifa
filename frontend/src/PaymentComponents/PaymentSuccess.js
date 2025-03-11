import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [message, setMessage] = useState("Verifying payment...");

    useEffect(() => {
        if (!sessionId) {
            setMessage("Invalid payment session.");
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_URL}/payment/verify?sessionId=${sessionId}`
                );
                const data = await response.json();

                if (data.success) {
                    setMessage("Payment successful! 🎉");
                    alert("Payment successful!");

                    // Call bookAppointment API after successful payment
                    const appointmentResponse = await fetch(
                        `${process.env.REACT_APP_SERVER_URL}/appointment/book`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                sessionId: sessionId, // Link payment to the appointment
                            }),
                        }
                    );

                    const appointmentData = await appointmentResponse.json();

                    if (appointmentData.success) {
                        alert("Appointment booked successfully!");
                    } else {
                        alert("Payment succeeded, but appointment booking failed.");
                    }
                } else {
                    setMessage("Payment failed. Please try again.");
                    alert("Payment was not successful.");
                }
            } catch (error) {
                console.error("Error verifying payment:", error);
                setMessage("Error verifying payment.");
                alert("Error verifying payment. Please contact support.");
            }
        };

        verifyPayment();
    }, [sessionId]);

    return <h2>{message}</h2>;
};

export default PaymentSuccess;
