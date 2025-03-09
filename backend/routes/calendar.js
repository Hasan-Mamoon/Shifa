import express from 'express';
import CalendarEvent from '../models/calendar.js'; // Ensure `.js` is included

const router = express.Router();

// Get all events for a given month
router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    const events = await CalendarEvent.find({ date: { $gte: start, $lte: end } });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get events for a specific date
router.get('/:date', async (req, res) => {
  try {
    const events = await CalendarEvent.find({ date: req.params.date });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new event
router.post('/', async (req, res) => {
  try {
    const newEvent = new CalendarEvent(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export const calendarRoutes = router;
