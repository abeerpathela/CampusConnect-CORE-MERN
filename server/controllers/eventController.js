const mongoose = require('mongoose');
const Event = require('../models/Event');
const Club = require('../models/Club');
const User = require('../models/User');
const Registration = require('../models/Registration');

// Helper to find event by ObjectId or title
const findEventById = async (identifier) => {
  if (!identifier) return null;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const eventById = await Event.findById(identifier);
    if (eventById) return eventById;
  }
  return await Event.findOne({
    $or: [
      { title: new RegExp(identifier.replace(/[-_]/g, ' '), 'i') },
    ],
  });
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getAllEvents = async (req, res, next) => {
  try {
    const { category, clubId, search } = req.query;
    const filter = {};

    if (category && category !== 'All' && category !== 'all') {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (clubId) {
      if (mongoose.Types.ObjectId.isValid(clubId)) {
        filter.clubId = clubId;
      }
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
        { clubName: searchRegex },
        { venue: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const events = await Event.find(filter).sort({ date: 1, createdAt: -1 });
    return res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await findEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    return res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin only)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      clubId,
      clubName,
      category,
      shortDescription,
      description,
      date,
      endDate,
      time,
      venue,
      capacity,
      fee,
      bannerImage,
      isRegistrationOpen,
      tags,
      requirements,
      speaker,
    } = req.body;

    let finalClubName = clubName;
    if (!finalClubName && clubId && mongoose.Types.ObjectId.isValid(clubId)) {
      const club = await Club.findById(clubId);
      if (club) {
        finalClubName = club.name;
      }
    }

    const event = await Event.create({
      title,
      clubId,
      clubName: finalClubName || 'Campus Club',
      category,
      shortDescription,
      description,
      date,
      endDate: endDate || date,
      time,
      venue,
      capacity: Number(capacity),
      registeredCount: 0,
      fee: fee || 'Free',
      bannerImage,
      isRegistrationOpen: isRegistrationOpen !== undefined ? !!isRegistrationOpen : true,
      tags: tags || ['CampusEvent'],
      requirements: requirements || ['Open for all students'],
      speaker: speaker || '',
    });

    return res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
const updateEvent = async (req, res, next) => {
  try {
    const event = await findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event and clean up associated registrations
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await Event.findByIdAndDelete(event._id);

    // Clean up associated registrations
    await Registration.deleteMany({ eventId: event._id });

    // Clean up registeredEvents in users
    await User.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id } }
    );

    return res.status(200).json({
      success: true,
      message: 'Event and associated registrations deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register user for an event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res, next) => {
  try {
    const event = await findEventById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if registration is open
    if (event.isRegistrationOpen === false) {
      return res.status(400).json({
        success: false,
        message: 'Registration for this event is closed',
      });
    }

    // Check capacity
    if (event.capacity && (event.registeredCount || 0) >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'This event has reached full capacity',
      });
    }

    // Check duplicate registration
    const existingRegistration = await Registration.findOne({
      eventId: event._id,
      $or: [{ userId: user._id }, { studentEmail: user.email }],
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }

    // Generate unique Ticket Number: CC-<CATEGORY_FIRST_4_LETTERS_UPPERCASE>-<RANDOM_4_DIGITS>
    const cleanCategory = (event.category || 'CAMPUS')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `CC-${cleanCategory}-${randomDigits}`;

    // Generate QR Code Data: CAMPUSCONNECT-TICKET-<ticketNumber>-<USER_NAME>
    const sanitizedUserName = (user.name || 'STUDENT')
      .toUpperCase()
      .replace(/\s+/g, '-');
    const qrCodeData = `CAMPUSCONNECT-TICKET-${ticketNumber}-${sanitizedUserName}`;

    // Create Registration Record
    const registration = await Registration.create({
      ticketNumber,
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      userId: user._id,
      studentName: user.name,
      studentEmail: user.email,
      rollNo: user.rollNo || '',
      department: user.department || 'Computer Science & Engineering',
      status: 'Confirmed',
      qrCodeData,
      registeredAt: new Date(),
    });

    // Increment registeredCount on Event
    event.registeredCount = (event.registeredCount || 0) + 1;
    await event.save();

    // Add event ID to User's registeredEvents if not already present
    const hasEventInUser = user.registeredEvents.some(
      (eId) => eId.toString() === event._id.toString()
    );
    if (!hasEventInUser) {
      user.registeredEvents.push(event._id);
      await user.save();
    }

    return res.status(201).json({
      success: true,
      registration,
      message: 'Registration confirmed! Your e-Ticket is ready.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendees for a specific event
// @route   GET /api/events/:id/attendees
// @access  Private (Admin only)
const getEventAttendees = async (req, res, next) => {
  try {
    const event = await findEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const registrations = await Registration.find({ eventId: event._id })
      .populate('userId', 'name email rollNo department semester')
      .sort({ registeredAt: -1 });

    return res.status(200).json(registrations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get registrations for a user
// @route   GET /api/events/user-registrations/:userId or GET /api/events/user/registrations
// @access  Private
const getUserRegistrations = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.user._id;

    // Check authorization: User can only view their own registrations unless they are Admin
    if (
      req.user.role !== 'admin' &&
      targetUserId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot access other users registrations',
      });
    }

    const registrations = await Registration.find({
      $or: [{ userId: targetUserId }, { studentEmail: req.user.email }],
    })
      .populate('eventId')
      .sort({ registeredAt: -1 });

    return res.status(200).json(registrations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventAttendees,
  getUserRegistrations,
};
