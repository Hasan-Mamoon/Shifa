import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import Connection from './config/mongodb.js'
import { doctorRouter } from './routes/doctor-routes.js'

const app = express()
dotenv.config();

Connection();  

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/doctor", doctorRouter);


app.listen(process.env.PORT, () => {
  console.log(`Server Started on port ${process.env.PORT}`);
});
