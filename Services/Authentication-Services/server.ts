import config from "config";
import app from "./src/providers/app";
//import connectDB from "./providers/Database";
import dotenv from 'dotenv';
require('dotenv').config();
dotenv.config();
const cors = require('cors');


const port = config.get('port');


app.use(cors());
app.listen(port, () => console.log(`Listening on port ${port}.`));
