<<<<<<< HEAD
// import express from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { Admin } from '../models/Admin.js';

// const router = express.Router();

// const DEFAULT_ADMIN = {
//   email: 'admin@gmail.com',
//   password: 'Admin@123',
// };

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {

//     if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
//       const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

//       return res.json({ token, userId: email, role: 'admin', email });
//     }

//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

//     res.json({ token, userId: admin._id, role: 'admin', email: admin.email });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// export { router as adminRoutes };

=======
>>>>>>> origin/integration
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { doctormodel } from '../models/doctor.js';
import { patientModel } from '../models/patient.js';
import { PendingDoctor } from '../models/PendingDoctor.js';

import dotenv from 'dotenv';
import multer from 'multer';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config(); // Load environment variables

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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if credentials match the default admin account
    if (
      email === process.env.DEFAULT_ADMIN_EMAIL &&
      password === process.env.DEFAULT_ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

      return res.json({ token, userId: email, role: 'admin', email });
    }

    // Check in the database if not default admin
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ email: admin.email, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, userId: admin._id, role: 'admin', email: admin.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/count', async (req, res) => {
  try {
    const doctorCount = await doctormodel.countDocuments();
    const patientCount = await patientModel.countDocuments();

    return res.status(200).json({ doctorCount, patientCount });
  } catch (err) {
    console.error('Error fetching counts:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/pending-doctors', async (req, res) => {
  try {
    const doctors = await PendingDoctor.find({ status: 'pending' });

    // Generate signed URLs for images
    const doctorsWithImages = await Promise.all(
      doctors.map(async (doctor) => {
        const imageUrl = doctor.image
          ? await getSignedUrl(
              s3,
              new GetObjectCommand({ Bucket: bucketName, Key: doctor.image }),
              { expiresIn: 3600 }
            )
          : null;

        const degreeUrl = doctor.degree
          ? await getSignedUrl(
              s3,
              new GetObjectCommand({ Bucket: bucketName, Key: doctor.degree }),
              { expiresIn: 3600 }
            )
          : null;

        return { ...doctor.toObject(), image: imageUrl, degree: degreeUrl };
      })
    );

    res.json(doctorsWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending doctors', error });
  }
});
router.put('/update-doctor-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const doctor = await PendingDoctor.findById(req.params.id);

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (status === 'approved') {
      const approvedDoctor = new doctormodel({
        email: doctor.email,
        password: doctor.password,
        name: doctor.name,
        image: doctor.image,
        speciality: doctor.speciality,
        experience: doctor.experience,
        about: doctor.about,
        fees: doctor.fees,
        degree: doctor.degree,
        address: doctor.address,
      });

      await approvedDoctor.save();

      await PendingDoctor.findByIdAndDelete(req.params.id);
    } else {
      // If rejected, just delete the pending doctor
      await PendingDoctor.findByIdAndDelete(req.params.id);
    }

    res.json({ message: `Doctor ${status === 'approved' ? 'approved' : 'rejected'}` });
  } catch (error) {
    console.error('Error updating doctor status:', error);
    res.status(500).json({ message: 'Error updating doctor status', error: error.message });
  }
});
//////////////////////////

// Apply Discount
router.post('/apply-discount', async (req, res) => {
  try {
    const { discountPercentage } = req.body; // Example: { discountPercentage: 10 }

    if (!discountPercentage || discountPercentage <= 0 || discountPercentage > 100) {
      return res.status(400).json({ message: 'Invalid discount percentage' });
    }

    const doctors = await doctormodel.find();

    for (const doctor of doctors) {
      if (!doctor.originalFees) {
        doctor.originalFees = doctor.fees; // Store original fee before discount
      }
      doctor.fees = Math.round(doctor.originalFees * (1 - discountPercentage / 100)); // Apply discount
      await doctor.save();
    }

    res.status(200).json({ message: 'Discount applied successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Remove Discount
router.post('/remove-discount', async (req, res) => {
  try {
    const doctors = await doctormodel.find();

    for (const doctor of doctors) {
      if (doctor.originalFees) {
        doctor.fees = doctor.originalFees; // Restore original fee
        doctor.originalFees = undefined; // Remove stored original fee
        await doctor.save();
      }
    }

    res.status(200).json({ message: 'Discount removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;

export { router as adminRoutes };
