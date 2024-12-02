import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import Connection from './config/mongodb.js'
import { doctorRouter } from './routes/doctor-routes.js'
import { patientRouter } from './routes/patient-routes.js'
import { slotsRouter } from './routes/slot-routes.js'
import { appointmentRouter } from './routes/appointment-routes.js'

const app = express()
dotenv.config();

Connection();  

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/doctor", doctorRouter);
app.use("/patient",patientRouter);
app.use("/slot",slotsRouter);
app.use("/appointment",appointmentRouter);


app.listen(process.env.PORT, () => {
  console.log(`Server Started on port ${process.env.PORT}`);
});
