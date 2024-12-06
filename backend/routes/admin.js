const express = require('express');
const { getPendingDoctors, approveDoctor, rejectDoctor } = require('../controllers/adminController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Protect routes with admin authentication
router.use(requireAuth('admin'));

// Admin endpoints
router.get('/pending-doctors', getPendingDoctors);
router.post('/approve-doctor/:id', approveDoctor);
router.post('/reject-doctor/:id', rejectDoctor);

module.exports = router;
