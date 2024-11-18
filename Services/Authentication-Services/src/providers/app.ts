import express, { Express } from "express";

import cors from "cors";



import mongoose from 'mongoose';

import bodyParser from 'body-parser';

require('dotenv').config();


const app: Express = express();
app.use(bodyParser.json());
app.use(cors());


app.use(express.json());

// app.get('/', (req, res) => {
//     res.json({"message": "Server is running :D"});
// });


export default app;