import express from 'express';
import CalendarEvent from '../models/calendar.js'; // Ensure `.js` is included
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all events for a given month
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { start, end } = req.query;
    const events = await CalendarEvent.find({ 
      date: { $gte: start, $lte: end },
      userId: req.user.id // Only fetch events for the logged-in user
    });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get events for a specific date
router.get('/:date', authenticateToken, async (req, res) => {
  try {
    const events = await CalendarEvent.find({ 
      date: req.params.date,
      userId: req.user.id // Only fetch events for the logged-in user
    });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events for date:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new event
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('User from token:', req.user);

    if (!req.user || !req.user.id) {
      console.error('No user ID available in request');
      return res.status(401).json({ error: 'User ID not found in token' });
    }

    if (!req.body.title || !req.body.date) {
      console.log('Missing required fields:', {
        hasTitle: !!req.body.title,
        hasDate: !!req.body.date
      });
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const eventData = {
      title: req.body.title,
      date: req.body.date,
      userId: req.user.id
    };

    console.log('Creating event with data:', eventData);

    const newEvent = new CalendarEvent(eventData);
    console.log('Created new event object:', newEvent);

    const savedEvent = await newEvent.save();
    console.log('Event saved successfully:', savedEvent);
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error('Error creating event:', {
      error: err,
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Error creating event' });
  }
});

// Delete an event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Only allow deletion if the event belongs to the user
    const event = await CalendarEvent.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: err.message });
  }
});

export const calendarRoutes = router;
