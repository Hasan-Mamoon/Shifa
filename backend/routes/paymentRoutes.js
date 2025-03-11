import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { doctorId, patientId, amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Appointment with Doctor ${doctorId}`,
            },
            unit_amount: amount * 100, // Stripe requires cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://localhost:3000',
      client_reference_id: `${doctorId}-${patientId}`, // ✅ Store doctor & patient info
    });
    

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const { sessionId } = req.query;
    console.log("Received session ID for verification:", sessionId); // ✅ Debugging

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Stripe session data:", session); // ✅ Debugging

    if (session.payment_status === 'paid') {
      res.json({ success: true, session });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export { router as paymentRoutes };
