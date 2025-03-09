import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

const router = express.Router();


const DEFAULT_ADMIN = {
  email: 'admin@gmail.com',
  password: 'Admin@123',
};


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
  
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

      return res.json({ token, userId: email, role: 'admin', email });
    }

   
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

   
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });


    const token = jwt.sign({ email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, userId: admin._id, role: 'admin', email: admin.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as adminRoutes };
