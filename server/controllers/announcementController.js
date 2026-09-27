const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
const getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({
      isPinned: -1,
      createdAt: -1,
    });
    return res.status(200).json(announcements);
  } catch (error) {
    next(error);
  }
};

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority, author, targetAudience, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for the announcement',
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'General',
      author: author || req.user?.name || 'Campus Administration',
      targetAudience: targetAudience || 'All Students',
      isPinned: !!isPinned,
    });

    return res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
const deleteAnnouncement = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Announcement removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
