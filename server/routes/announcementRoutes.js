const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllAnnouncements)
  .post(protect, authorize('admin'), createAnnouncement);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteAnnouncement);

module.exports = router;
