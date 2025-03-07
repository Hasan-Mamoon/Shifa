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

const app = express();
dotenv.config();

Connection();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use('/doctor', doctorRouter);
app.use('/patient', patientRouter);
app.use('/slot', slotsRouter);
app.use('/appointment', appointmentRouter);
app.use('/blog', blogRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server Started on port ${process.env.PORT}`);
});
