import express from 'express';
import { doctormodel } from '../models/doctor.js';
import multer from 'multer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PendingDoctor } from '../models/PendingDoctor.js';

import path from 'path';
import sharp from 'sharp';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

router.get('/get-doctor', async (req, res) => {
  const { email } = req.query;
  console.log('email: ', email);

  try {
    const doctors = await doctormodel.find({ email: email });
    if (!doctors) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const getObjectParams = {
      Bucket: bucketName,
      Key: doctors[0].image,
    };

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    doctors[0].image = url;

    return res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const doctor = await doctormodel.findOne({ email });

    if (!doctor) {
      return res.status(400).json({ message: 'Email not registered' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, doctor.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      userId: doctor._id,
      email: doctor.email,
    });
  } catch (err) {
    console.error('Doctor Login Error:', err);
    return res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// router.post(
//   '/add-doctor',
//   upload.fields([
//     { name: 'degree', maxCount: 1 },
//     { name: 'image', maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       let address1 = req.body.address;
//       if (typeof address1 === 'string') {
//         address1 = JSON.parse(address1);
//       }

//       console.log('req.body', req.body);
//       console.log('req.files', req.files);

//       if (!req.files || !req.files.image || !req.files.degree) {
//         return res.status(400).json({ message: 'Image and Degree files are required' });
//       }

//       const imageName = randomImageName();
//       const buffer = await sharp(req.files.image[0].buffer)
//         .resize({ height: 1920, width: 1080, fit: 'contain' })
//         .toBuffer();

//       const imageParams = {
//         Bucket: bucketName,
//         Key: imageName,
//         Body: buffer,
//         ContentType: req.files.image[0].mimetype,
//       };

//       const imageCommand = new PutObjectCommand(imageParams);
//       await s3.send(imageCommand);

//       const degreeName = randomImageName();
//       const degreeBuffer = req.files.degree[0].buffer;

//       const degreeParams = {
//         Bucket: bucketName,
//         Key: degreeName,
//         Body: degreeBuffer,
//         ContentType: req.files.degree[0].mimetype,
//       };

//       const degreeCommand = new PutObjectCommand(degreeParams);
//       await s3.send(degreeCommand);

//       const { email, password, name, speciality, experience, about, fees } = req.body;

//       const hashedPassword = await bcrypt.hash(password, 10);

//       const newDoctor = new doctormodel({
//         email,
//         password: hashedPassword,
//         name,
//         image: imageName,
//         speciality,
//         degree: degreeName,
//         experience,
//         about,
//         fees,
//         address: address1,
//       });

//       const savedDoctor = await newDoctor.save();
//       return res.status(201).json({ message: 'Doctor added successfully', doctor: savedDoctor });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'Error adding doctor', error: err });
//     }
//   }
// );




// router.post('/add-doctor', upload.fields([{ name: 'degree', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
//   try {
//     const { email, password, name, speciality, experience, about, fees } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const imageName = randomImageName();
//     const imageBuffer = await sharp(req.files.image[0].buffer)
//       .resize({ width: 300, height: 300, fit: 'cover' })
//       .toBuffer();

//     const degreeName = randomImageName();
//     const degreeBuffer = req.files.degree[0].buffer;

//     await s3.send(new PutObjectCommand({ Bucket: bucketName, Key: imageName, Body: imageBuffer, ContentType: req.files.image[0].mimetype }));
//     await s3.send(new PutObjectCommand({ Bucket: bucketName, Key: degreeName, Body: degreeBuffer, ContentType: req.files.degree[0].mimetype }));

//     const newDoctor = new doctormodel({ email, password: hashedPassword, name, image: imageName, speciality, degree: degreeName, experience, about, fees, status: 'pending' });

//     await newDoctor.save();
//     res.status(201).json({ message: 'Doctor request sent for approval' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error adding doctor', error: err });
//   }
// });


router.post(
  '/add-doctor',
  upload.fields([
    { name: 'degree', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { email, password, name, speciality, experience, about, fees } = req.body;

      // Parse address from the request body (handling JSON string case)
      let address = req.body.address;
      if (typeof address === 'string') {
        try {
          address = JSON.parse(address);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid address format' });
        }
      }

      // Ensure image and degree files exist
      if (!req.files || !req.files.image || !req.files.degree) {
        return res.status(400).json({ message: 'Image and Degree files are required' });
      }

      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // Process & Upload Image
      const imageName = `${randomImageName()}.jpg`;
      const imageBuffer = await sharp(req.files.image[0].buffer)
        .resize({ width: 300, height: 300, fit: 'cover' })
        .toBuffer();

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: imageName,
          Body: imageBuffer,
          ContentType: req.files.image[0].mimetype,
        })
      );

      // Process & Upload Degree
      const degreeName = `${randomImageName()}.pdf`;
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: degreeName,
          Body: req.files.degree[0].buffer,
          ContentType: req.files.degree[0].mimetype,
        })
      );

      // Create a new pending doctor record
      const newPendingDoctor = new PendingDoctor({
        email,
        password: hashedPassword,
        name,
        speciality,
        experience,
        about,
        fees,
        address, // Store address
        image: imageName,
        degree: degreeName,
        status: 'pending', // Waiting for admin approval
      });

      await newPendingDoctor.save();
      res.status(201).json({ message: 'Doctor request sent for approval' });
    } catch (err) {
      console.error('Error adding doctor:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  }
);




router.get('/doctors-all', async (req, res) => {
  try {
    const doctors = await doctormodel.find({});

    for (const doctor of doctors) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: doctor.image,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      doctor.image = url;
    }

    if (!doctors) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/:speciality', async (req, res) => {
  try {
    const { speciality } = req.params;
    console.log('sp', speciality);
    const doctors = await doctormodel.find({
      speciality: speciality.toString(),
    });


    for (const doctor of doctors) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: doctor.image,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      doctor.image = url;
    }

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found with this speciality' });
    }

    return res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error retrieving doctors', error: err });
  }
});

router.put('/update/:email', upload.single('image'), async (req, res) => {
  try {
    const { email } = req.params;
    const { name, speciality, degree, experience, about, fees, address } = req.body;

    const updatedData = {
      name,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: address ? JSON.parse(address) : undefined,
    };

    if (req.file) {
      const imageName = randomImageName();
      const buffer = await sharp(req.file.buffer)
        .resize({ height: 1920, width: 1080, fit: 'contain' })
        .toBuffer();

      const imageParams = {
        Bucket: bucketName,
        Key: imageName,
        Body: buffer,
        ContentType: req.file.mimetype,
      };

      await s3.send(new PutObjectCommand(imageParams));

      updatedData.image = imageName;
    }

    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    const updatedDoctor = await doctormodel.findOneAndUpdate({ email }, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (updatedDoctor.image) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: updatedDoctor.image,
      };
      const command = new GetObjectCommand(getObjectParams);
      updatedDoctor.image = await getSignedUrl(s3, command, {
        expiresIn: 3600,
      });
    }

    return res.status(200).json({ message: 'Doctor updated successfully', doctor: updatedDoctor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating doctor', error: err.message });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, speciality, degree, experience, about, fees, address } = req.body;

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

    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined || updatedData[key] === null) {
        delete updatedData[key];
      }
    });

    const updatedDoctor = await doctormodel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.status(200).json({ message: 'Doctor updated successfully', doctor: updatedDoctor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating doctor', error: err.message });
  }
});

// Get doctor details with average rating
router.get('/:id', async (req, res) => {
  try {
    const doctor = await doctormodel.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const avgRating =
      doctor.reviews.length > 0
        ? doctor.reviews.reduce((sum, r) => sum + r.rating, 0) / doctor.reviews.length
        : 0;

    res.json({ ...doctor.toObject(), avgRating });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add or Update Review
router.post('/:id/add-review', async (req, res) => {
  try {
    const { userId, rating } = req.body;
    const doctor = await doctormodel.findById(req.params.id);

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Prevent duplicate reviews
    const existingReviewIndex = doctor.reviews.findIndex((r) => r.userId.toString() === userId);

    if (existingReviewIndex !== -1) {
      // Update existing review
      doctor.reviews[existingReviewIndex].rating = rating;
    } else {
      // Add new review
      doctor.reviews.push({ userId, rating });
    }

    await doctor.save();
    res.json({ message: 'Review added successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting review' });
  }
});

// Get Reviews for a Doctor
router.get('/:id/reviews', async (req, res) => {
  try {
    const doctor = await doctormodel.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json({ reviews: doctor.reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

export { router as doctorRouter };
