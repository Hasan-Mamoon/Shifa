import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Checkout = async (appointmentData) => {
  try {
    localStorage.setItem('appointmentData', JSON.stringify(appointmentData));
    const stripe = await stripePromise;

    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/payment/create-checkout-session`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      }
    );

    const data = await response.json();

    if (!data.sessionId) {
      console.error('Error: No session ID received', data);
      alert('Payment failed. Please try again.');
      return false; // Indicate failure
    }

    // Redirect to Stripe Checkout
    await stripe.redirectToCheckout({ sessionId: data.sessionId });

    // 🚀 We no longer check payment here! Verification happens in `PaymentSuccess.js`
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Payment failed. Please try again.');
    return false;
  }
};

export default Checkout;
