const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventAttendees,
  getUserRegistrations,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Specific sub-routes before dynamic /:id parameter
router.get('/user/registrations', protect, getUserRegistrations);
router.get('/user-registrations/:userId', protect, getUserRegistrations);

router.route('/')
  .get(getAllEvents)
  .post(protect, authorize('admin'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorize('admin'), updateEvent)
  .delete(protect, authorize('admin'), deleteEvent);

router.post('/:id/register', protect, registerForEvent);
router.get('/:id/attendees', protect, authorize('admin'), getEventAttendees);

module.exports = router;
