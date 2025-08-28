import express from 'express';
import { slotModel } from '../models/timeslots.js';

const router = express.Router();
router.post('/add', async (req, res) => {
  const { doctorId, date, slots } = req.body;

  try {
    const existingRecord = await slotModel.findOne({ doctorId, date });

    if (existingRecord) {
      const newSlots = slots.map((slot) => ({ time: slot }));
      const updatedSlots = [
        ...existingRecord.slots,
        ...newSlots.filter(
          (newSlot) =>
            !existingRecord.slots.some((existingSlot) => existingSlot.time === newSlot.time)
        ),
      ];
      existingRecord.slots = updatedSlots;
      await existingRecord.save();
      res.status(200).json({ message: 'Slots updated successfully!' });
    } else {
      const newSlots = new slotModel({
        doctorId,
        date,
        slots: slots.map((slot) => ({ time: slot })),
      });
      await newSlots.save();
      res.status(201).json({ message: 'Slots added successfully!' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding slots', error: err.message });
  }
});

router.post('/book', async (req, res) => {
  const { doctorId, date, time, patientEmail } = req.body;

  try {
    const patient = await patientModel.findOne({ email: patientEmail });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const slotRecord = await slotModel.findOne({ doctorId, date });
    if (!slotRecord) {
      return res.status(404).json({ message: 'No slots available for this doctor and date' });
    }

    const slot = slotRecord.slots.find((slot) => slot.time === time);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    slot.isBooked = true;
    slot.patient = patient._id;

    await slotRecord.save();
    res.status(200).json({ message: 'Slot booked successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error booking slot', error: err.message });
  }
});

router.get('/booked', async (req, res) => {
  const { doctorId, date } = req.query;

  try {
    const slotRecord = await slotModel
      .findOne({ doctorId, date })
      .populate('slots.patient', 'name email');

    if (!slotRecord) {
      return res.status(404).json({ message: 'No slots found for this doctor and date' });
    }

    const bookedSlots = slotRecord.slots.filter((slot) => slot.isBooked);
    res.status(200).json(bookedSlots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving booked slots', error: err.message });
  }
});

router.post('/cancel', async (req, res) => {
  const { doctorId, date, time } = req.body;

  try {
    const slotRecord = await slotModel.findOne({ doctorId, date });
    if (!slotRecord) {
      return res.status(404).json({ message: 'No slots found for this doctor and date' });
    }

    const slot = slotRecord.slots.find((slot) => slot.time === time);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (!slot.isBooked) {
      return res.status(400).json({ message: 'Slot is not booked' });
    }

    slot.isBooked = false;
    slot.patient = undefined;

    await slotRecord.save();
    res.status(200).json({ message: 'Slot booking canceled successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error canceling slot', error: err.message });
  }
});

router.get('/dates', async (req, res) => {
  const { doctorId } = req.query;

  if (!doctorId) {
    return res.status(400).json({ message: 'Doctor ID is required.' });
  }

  try {
    const dates = await slotModel.find({ doctorId }).distinct('date');

    return res.status(200).json(dates);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching dates.', error });
  }
});

router.get('/appointments', async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ message: 'Doctor ID and date are required.' });
  }

  try {
    const slots = await slotModel.findOne({ doctorId, date }, { slots: 1 });

    if (!slots) {
      return res.status(404).json({ message: 'No slots found for the given date.' });
    }

    return res.status(200).json(slots.slots);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching slots.', error });
  }
});

router.get('/slotsbyid', async (req, res) => {
  const { doctorId, date } = req.query;

  try {
    const slotData = await slotModel.findOne({ doctorId, date }).populate('slots.patient', 'name');

    if (!slotData) {
      return res.status(404).json({ message: 'No slots found for the selected doctor and date.' });
    }

    const slotsWithIds = slotData.slots.map((slot) => ({
      slotId: slot._id,
      time: slot.time,
      isBooked: slot.isBooked,
      patient: slot.patient ? { id: slot.patient._id, name: slot.patient.name } : null,
    }));

    res.status(200).json(slotsWithIds);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Failed to fetch slots. Please try again later.' });
  }
});
router.get('/stats', async (req, res) => {
  const { doctorId } = req.query;
  if (!doctorId) {
    return res.status(400).json({ message: 'Doctor ID is required' });
  }

  try {
    const appointments = await appointmentModel.find({ doctorId });
    const slots = await slotModel.find({ doctorId });

    // Count booked and available slots
    const bookedCount = appointments.length;
    const availableCount = slots.filter((slot) => !slot.isBooked).length;

    res.json({ totalAppointments: bookedCount, availableSlots: availableCount });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as slotsRouter };
