import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Connection from './config/mongodb.js';
import { doctorRouter } from './routes/doctor-routes.js';
import { patientRouter } from './routes/patient-routes.js';
import { slotsRouter } from './routes/slot-routes.js';
import { appointmentRouter } from './routes/appointment-routes.js';
import { blogRouter } from './routes/blogRoutes.js';
import { calendarRoutes } from './routes/calendar.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { paymentRoutes } from './routes/paymentRoutes.js';

const app = express();
dotenv.config();

// Only connect to MongoDB if not in test environment
if (process.env.NODE_ENV !== 'test') {
  Connection();
}

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000', // Must match frontend origin exactly
    credentials: true, // Allows cookies
    allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow Authorization
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allow required methods
  })
);

//Handle Preflight Requests (OPTIONS)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204); // Respond with No Content (Preflight OK)
});

app.use('/doctor', doctorRouter);
app.use('/patient', patientRouter);
app.use('/slot', slotsRouter);
app.use('/appointment', appointmentRouter);
app.use('/blog', blogRouter);
app.use('/calendar', calendarRoutes);
app.use('/admin', adminRoutes);
app.use('/payment', paymentRoutes);

// Only start the server if not being imported for testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT, () => {
    console.log(`Server Started on port ${process.env.PORT}`);
  });
}

export default app;
