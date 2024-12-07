import express from "express";
import multer from "multer";
import sharp from "sharp";
import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand  } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { patientModel } from "../models/patient.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const randomImageName = (bytes =32)=> crypto.randomBytes(bytes).toString('hex') 


router.post("/add-patient", upload.single("image"), async (req, res) => {
  let address1 = req.body.address;

  // if (typeof address === "string") {
  //   address = JSON.parse(address);
  // }
  if (typeof address1 === "string") {
    try {
      address1 = JSON.parse(address1);
    } catch (error) {
      return res.status(400).json({ message: "Invalid address format" });
    }
  }
  console.log("req.body",req.body)
  console.log("req.file",req.file)

  const imageName = randomImageName()
  const buffer = await sharp(req.file.buffer).resize({height:144,width:144,fit:"contain"}).toBuffer()
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  try{

    const { email, name, gender, dob, phone, age, medicalHistory } = req.body;

    const newPatient = new patientModel({
      email,
      name,
      gender,
      dob,
      phone,
      age,
      image: imageName, // Save the image name or URL
      address:address1,
      medicalHistory
    });

    const savedPatient = await newPatient.save();

    return res
      .status(201)
      .json({ message: "Patient added successfully", patient: savedPatient });
  }

    
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error adding patient", error: err });
  }
});

  router.get("/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const patient = await patientModel.find({email});
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      console.log("p: ",patient)
      const getObjectParams = {
        
        Bucket:bucketName,
        Key:patient[0].image,
        
      } 
      console.log("key: ",getObjectParams.Key)
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      patient[0].image = url
      res.status(200).json(patient);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching patients", error: err.message });
    }
  });


  // router.put("/update/:email", async (req, res) => {
  //   try {
  //     const { email } = req.params;
  //     const updatedPatient = await patientModel.findOneAndUpdate(
  //       { email },
  //       req.body,
  //       { new: true, runValidators: true }
  //     );
  
  //     if (!updatedPatient) {
  //       return res.status(404).json({ message: "Patient not found" });
  //     }
  //     res.status(200).json({ message: "Patient updated successfully", updatedPatient });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: "Error updating patient", error: err.message });
  //   }
  // });

  router.put("/edit-patient/:email", upload.single("image"), async (req, res) => {
    const { email } = req.params;
    let address = req.body.address;
  
    // Parse address if it's a string
    if (typeof address === "string") {
      address = JSON.parse(address);
    }
  
    try {
      const patient = await patientModel.findOne({ email });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
  
      let imageName = patient.image; // Keep existing image unless a new one is uploaded
  
      // Handle optional image upload
      if (req.file) {
        imageName = randomImageName();
  
        // Resize the image using sharp
        const buffer = await sharp(req.file.buffer)
          .resize({ height: 144, width: 144, fit: "contain" })
          .toBuffer();
  
        // Upload to S3
        const params = {
          Bucket: bucketName,
          Key: imageName,
          Body: buffer,
          ContentType: req.file.mimetype,
        };
  
        const command = new PutObjectCommand(params);
        await s3.send(command);
      }
  
      // Update patient fields
      const updatedData = {
        name: req.body.name || patient.name,
        gender: req.body.gender || patient.gender,
        dob: req.body.dob || patient.dob,
        phone: req.body.phone || patient.phone,
        address: address || patient.address,
        medicalHistory: req.body.medicalHistory || patient.medicalHistory,
        image: imageName, // Use the updated or existing image
      };
  
      // Perform the update
      const updatedPatient = await patientModel.findOneAndUpdate(
        { email },
        { $set: updatedData },
        { new: true } // Return the updated document
      );
  
      return res.status(200).json({ message: "Patient updated successfully", patient: updatedPatient });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating patient", error: err });
    }
  });
  
  router.delete("/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const deletedPatient = await patientModel.findOneAndDelete({ email });
  
      if (!deletedPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.status(200).json({ message: "Patient deleted successfully", deletedPatient });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting patient", error: err.message });
    }
  });

  export {router as patientRouter}
  
  

