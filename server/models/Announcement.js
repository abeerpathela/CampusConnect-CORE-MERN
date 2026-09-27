const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide the announcement title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide the announcement content'],
      trim: true,
    },
    priority: {
      type: String,
      enum: [
        'URGENT',
        'EVENT_ALERT',
        'GENERAL',
        'ACADEMIC',
        'Urgent',
        'Event Alert',
        'General',
        'Academic',
      ],
      default: 'General',
    },
    author: {
      type: String,
      default: 'Campus Administration',
      trim: true,
    },
    targetAudience: {
      type: String,
      default: 'All Students',
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
