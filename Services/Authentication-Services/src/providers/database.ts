import mongoose from 'mongoose';
import config from "config";


const dbURI = ""; // add your mongodb cloud link here

async function connectDB(): Promise <void> {
  console.log("Trying to connect to database.......");  
  try {
      
        await mongoose.connect(dbURI);
        console.log("Connected to database.");
    } catch (error) {
        console.log("Cannot connect to database.", error);
        process.exit(1);
    }
}
  



  export default connectDB