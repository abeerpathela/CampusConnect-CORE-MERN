const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide the club name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide the club category'],
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide the club description'],
      trim: true,
    },
    leadCoordinator: {
      type: String,
      default: 'Lead Coordinator',
      trim: true,
    },
    facultyAdvisor: {
      type: String,
      default: 'Faculty Advisor',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    foundedYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    membersCount: {
      type: Number,
      default: 1,
      min: [0, 'Member count cannot be negative'],
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    },
    logo: {
      type: String,
      default: '✨',
    },
    tags: {
      type: [String],
      default: ['Campus', 'StudentActivity'],
    },
    meetingSchedule: {
      type: String,
      default: 'Weekly Meetings',
      trim: true,
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      discord: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name if not provided
clubSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;
