import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Checkout = async (appointmentData) => {
  try {
    const stripe = await stripePromise;

    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/payment/create-checkout-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      },
    );
    console.log(response);
    const data = await response.json();

    if (!data.sessionId) {
      console.error('Error: No session ID received', data);
      alert('Payment failed. Please try again.');
      return false; // Indicate failure
    }

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

    if (error) {
      console.error('Stripe Checkout error:', error);
      alert('Payment failed. Please try again.');
      return false;
    }

    // Poll the server for payment status
    const paymentStatus = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/payment/verify?sessionId=${data.sessionId}`,
    );
    console.log(paymentStatus);
    const paymentResult = await paymentStatus.json();

    if (paymentResult.success) {
      return true; // Payment successful
    } else {
      alert('Payment was not successful.');
      return false;
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Payment failed. Please try again.');
    return false;
  }
};

export default Checkout;
