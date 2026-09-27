const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      unique: true,
      trim: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
    },
    eventTitle: {
      type: String,
      default: '',
      trim: true,
    },
    eventDate: {
      type: String,
      default: '',
      trim: true,
    },
    eventTime: {
      type: String,
      default: '',
      trim: true,
    },
    eventVenue: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    studentName: {
      type: String,
      default: '',
      trim: true,
    },
    studentEmail: {
      type: String,
      default: '',
      trim: true,
    },
    rollNo: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      default: 'Confirmed',
      trim: true,
    },
    qrCodeData: {
      type: String,
      default: '',
      trim: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate registrations in MongoDB
registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
