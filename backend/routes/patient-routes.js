import express from 'express';
import multer from 'multer';

import bcrypt from 'bcryptjs';
import sharp from 'sharp';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { patientModel } from '../models/patient.js';
import { appointmentModel } from '../models/appointment.js';
import mongoose from 'mongoose';

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

router.post('/add-patient', upload.single('image'), async (req, res) => {
  const { email, password, name, address, phone, gender, medicalHistory, dob } = req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !dob ||
    !address ||
    !address.line1 ||
    !address.line2 ||
    !password
  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existingPatient = await patientModel.findOne({ email });
  if (existingPatient) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  const imageName = randomImageName();
  const buffer = await sharp(req.file.buffer)
    .resize({ height: 144, width: 144, fit: 'contain' })
    .toBuffer();

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3.send(command);

    const newPatient = new patientModel({
      name,
      email,
      phone,
      gender,
      medicalHistory,
      address,
      dob,
      image: imageName,
      password,
    });

    const savedPatient = await newPatient.save();
    return res.status(201).json({ message: 'Patient added successfully', patient: savedPatient });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error adding patient', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const patient = await patientModel.findOne({ email });

    if (!patient) {
      return res.status(400).json({ message: 'Email not registered' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, patient.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: patient._id, role: 'patient' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      userId: patient._id,
      email: patient.email,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

router.get('/details', async (req, res) => {
  try {
    const { slotId, patientId } = req.query;

    if (!slotId || !patientId) {
      return res.status(400).json({ error: 'slotId and patientId are required' });
    }

    // Convert IDs to ObjectId
    const slotObjectId = new mongoose.Types.ObjectId(slotId);
    const patientObjectId = new mongoose.Types.ObjectId(patientId);

    // Find the appointment based on slotId and patientId
    const appointment = await appointmentModel.findOne({
      slotId: slotObjectId,
      patientId: patientObjectId,
    });
    console.log('Appointment:', appointment);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({
      type: appointment.type,
      meetingLink: appointment.meetingLink || null,
    });
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bid/:id', async (req, res) => {
  try {
    console.log('ID: ', req.params.id);
    const patient = await patientModel.findById(req.params.id);
    console.log('PATIENT: ', patient);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    return res.status(200).json(patient);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching patient details', error });
  }
});

router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Email: ', email);
    const patient = await patientModel.findOne({ email }); // Use findOne instead of find

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    console.log('Patient found: ', patient);

    if (!patient.image) {
      return res.status(400).json({ message: 'No image found for this patient' });
    }

    const getObjectParams = {
      Bucket: bucketName,
      Key: patient.image,
    };

    console.log('S3 Key: ', getObjectParams.Key);

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    patient.image = url;

    res.status(200).json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching patient', error: err.message });
  }
});

router.put('/edit-patient/:email', upload.single('image'), async (req, res) => {
  const { email } = req.params;
  let address = req.body.address;

  if (typeof address === 'string') {
    address = JSON.parse(address);
  }

  try {
    const patient = await patientModel.findOne({ email });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    let imageName = patient.image;

    if (req.file) {
      imageName = randomImageName();

      const buffer = await sharp(req.file.buffer)
        .resize({ height: 144, width: 144, fit: 'contain' })
        .toBuffer();

      const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
    }

    const updatedData = {
      name: req.body.name || patient.name,
      gender: req.body.gender || patient.gender,
      dob: req.body.dob || patient.dob,
      phone: req.body.phone || patient.phone,
      address: address || patient.address,
      medicalHistory: req.body.medicalHistory || patient.medicalHistory,
      image: imageName,
    };

    const updatedPatient = await patientModel.findOneAndUpdate(
      { email },
      { $set: updatedData },
      { new: true }
    );

    return res.status(200).json({
      message: 'Patient updated successfully',
      patient: updatedPatient,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating patient', error: err });
  }
});

router.put('/update/:id', async (req, res) => {
  const { id } = req.params; // Patient ID
  const { medicalHistory } = req.body; // Updated medical history

  try {
    // Validate the patient ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid patient ID' });
    }

    // Find the patient by ID and update their medical history
    const updatedPatient = await patientModel.findByIdAndUpdate(
      id,
      { medicalHistory },
      { new: true } // Return the updated document
    );

    // If the patient is not found
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Return the updated patient
    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error('Error updating medical history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const deletedPatient = await patientModel.findOneAndDelete({ email });

    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ message: 'Patient deleted successfully', deletedPatient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting patient', error: err.message });
  }
});

export { router as patientRouter };
