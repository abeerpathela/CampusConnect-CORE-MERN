const mongoose = require('mongoose');
const Club = require('../models/Club');
const User = require('../models/User');

// Helper to find club by ObjectId or slug
const findClubByIdOrSlug = async (identifier) => {
  if (!identifier) return null;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const clubById = await Club.findById(identifier);
    if (clubById) return clubById;
  }
  return await Club.findOne({
    $or: [
      { slug: identifier.toLowerCase() },
      { name: new RegExp(`^${identifier.replace(/[-_]/g, ' ')}$`, 'i') },
    ],
  });
};

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
const getAllClubs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All' && category !== 'all') {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { tagline: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const clubs = await Club.find(filter).sort({ featured: -1, createdAt: -1 });
    return res.status(200).json(clubs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single club by ID or slug
// @route   GET /api/clubs/:id
// @access  Public
const getClubById = async (req, res, next) => {
  try {
    const club = await findClubByIdOrSlug(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    return res.status(200).json(club);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Private (Admin only)
const createClub = async (req, res, next) => {
  try {
    const {
      name,
      category,
      tagline,
      description,
      leadCoordinator,
      facultyAdvisor,
      email,
      foundedYear,
      membersCount,
      bannerImage,
      logo,
      tags,
      meetingSchedule,
      socialLinks,
      featured,
    } = req.body;

    const club = await Club.create({
      name,
      category,
      tagline,
      description,
      leadCoordinator,
      facultyAdvisor,
      email,
      foundedYear: foundedYear || new Date().getFullYear(),
      membersCount: membersCount !== undefined ? membersCount : 1,
      bannerImage,
      logo,
      tags,
      meetingSchedule,
      socialLinks,
      featured: !!featured,
    });

    return res.status(201).json(club);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a club
// @route   PUT /api/clubs/:id
// @access  Private (Admin only)
const updateClub = async (req, res, next) => {
  try {
    let club = await findClubByIdOrSlug(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    // Update fields
    const updatedClub = await Club.findByIdAndUpdate(
      club._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedClub);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a club
// @route   DELETE /api/clubs/:id
// @access  Private (Admin only)
const deleteClub = async (req, res, next) => {
  try {
    const club = await findClubByIdOrSlug(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    await Club.findByIdAndDelete(club._id);

    // Remove club from all users' joinedClubs
    await User.updateMany(
      { joinedClubs: club._id },
      { $pull: { joinedClubs: club._id } }
    );

    return res.status(200).json({
      success: true,
      message: 'Club deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a club
// @route   POST /api/clubs/:id/join
// @access  Private
const joinClub = async (req, res, next) => {
  try {
    const club = await findClubByIdOrSlug(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    const user = await User.findById(req.user._id);

    // Check if already joined
    const isAlreadyMember = user.joinedClubs.some(
      (cId) => cId.toString() === club._id.toString()
    );

    if (!isAlreadyMember) {
      user.joinedClubs.push(club._id);
      await user.save();

      club.membersCount = (club.membersCount || 0) + 1;
      await club.save();
    }

    const updatedUser = await User.findById(user._id);

    return res.status(200).json({
      success: true,
      user: updatedUser,
      club,
      message: 'Joined club successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave a club
// @route   POST /api/clubs/:id/leave
// @access  Private
const leaveClub = async (req, res, next) => {
  try {
    const club = await findClubByIdOrSlug(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    const user = await User.findById(req.user._id);

    const isMember = user.joinedClubs.some(
      (cId) => cId.toString() === club._id.toString()
    );

    if (isMember) {
      user.joinedClubs = user.joinedClubs.filter(
        (cId) => cId.toString() !== club._id.toString()
      );
      await user.save();

      if (club.membersCount > 0) {
        club.membersCount -= 1;
        await club.save();
      }
    }

    const updatedUser = await User.findById(user._id);

    return res.status(200).json({
      success: true,
      user: updatedUser,
      club,
      message: 'Left club successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
};
