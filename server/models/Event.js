const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide the event title'],
      trim: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Please provide the associated club ID'],
    },
    clubName: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide the event category'],
      trim: true,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide the detailed event description'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Please provide the event date'],
      trim: true,
    },
    endDate: {
      type: String,
      default: '',
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Please provide the event time'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Please provide the event venue'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify the maximum seating capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: [0, 'Registered count cannot be negative'],
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    },
    fee: {
      type: String,
      default: 'Free',
      trim: true,
    },
    isRegistrationOpen: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: ['CampusEvent'],
    },
    requirements: {
      type: [String],
      default: ['Open for all students'],
    },
    speaker: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
