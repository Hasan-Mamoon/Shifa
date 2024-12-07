import express from "express";
import { doctormodel } from "../models/doctor.js";
import multer from "multer";
import crypto from 'crypto'
import sharp from "sharp";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand  } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";




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

router.get("/get-doctor", async (req, res) => {
  const { id } = req.query;
  console.log("ID: ",id)

  try{
    const doctors = await doctormodel.find({ _id: id });
  if(!doctors){
    return res.status(404).json({ message: "Doctor not found" });
  }

  const getObjectParams = {
        
    Bucket:bucketName,
    Key:doctors[0].image
  } 

  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  doctors[0].image = url
  
  return res.status(200).json(doctors);

    
  }catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/add-doctor", upload.single("image"), async (req, res) => {
  let address1 = req.body.address;
    if (typeof address1 === "string") {
      address1 = JSON.parse(address1);
    }
  console.log("req.body",req.body)
  console.log("req.file",req.file)

  const imageName = randomImageName()
  const buffer = await sharp(req.file.buffer).resize({height:1920,width:1080,fit:"contain"}).toBuffer()
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  
  
  try {
    const {
      email,
      name,
      speciality,
      degree,
      experience,
      about,
      fees
    } = req.body;

    const newDoctor = new doctormodel({
      email,
      name ,
      image : imageName,
      speciality,
      degree,
      experience,
      about,
      fees,
      address:address1
    });

    const savedDoctor = await newDoctor.save();

    return res
      .status(201)
      .json({ message: "Doctor added successfully", doctor: savedDoctor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error adding doctor", error: err });
  }
});

router.get("/doctors-all", async (req, res) => {
  try {
    const doctors = await doctormodel.find({});
    console.log('doc', doctors)
   

    for(const doctor of doctors){
      const getObjectParams = {
        
        Bucket:bucketName,
        Key:doctor.image
      } 
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      doctor.image = url

    }

    if (!doctors) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:speciality", async (req, res) => {
  try {
    const {speciality}  = req.params;
    console.log("sp", speciality)
    const doctors = await doctormodel.find({ speciality: speciality.toString() });

    console.log('doc', doctors)
   

    for(const doctor of doctors){
      const getObjectParams = {
        
        Bucket:bucketName,
        Key:doctor.image
      } 
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      doctor.image = url

    }

   

    if (doctors.length === 0) {
      return res.status(404).json({ message: "No doctors found with this speciality" });
    }

    return res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving doctors", error: err });
  }
});

router.put("/update/:email", async (req, res) => {
  try {
    const { email } = req.params; // Get the email from route parameters
    const {
      name,
      image,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    const updatedData = {
      name,
      image,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    };

    // Remove undefined or null fields to prevent updating with empty values
    // Object.keys(updatedData).forEach((key) => {
    //   if (updatedData[key] === undefined || updatedData[key] === null) {
    //     delete updatedData[key];
    //   }
    // });

    const updatedDoctor = await doctormodel.findOneAndUpdate(
      { email }, // Search for the doctor by email
      updatedData, // Fields to update
      { new: true } // Return the updated document
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res
      .status(200)
      .json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error updating doctor", error: err.message });
  }
});

router.delete("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const doctorToDelete = await doctormodel.find({ email });


    if (!doctorToDelete) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    const params = {
      Bucket: bucketName,
      Key:doctorToDelete[0].image
    }

    const command = new DeleteObjectCommand(params)
    await s3.send(command)

    const deletedDoctor = await doctormodel.findOneAndDelete({ email });


    return res
      .status(200)
      .json({ message: "Doctor deleted successfully", doctor: deletedDoctor });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error deleting doctor", error: err.message });
  }
});

export { router as doctorRouter };
