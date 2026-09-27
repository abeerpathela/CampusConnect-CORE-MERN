const express = require('express');
const router = express.Router();
const {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
} = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllClubs)
  .post(protect, authorize('admin'), createClub);

router.route('/:id')
  .get(getClubById)
  .put(protect, authorize('admin'), updateClub)
  .delete(protect, authorize('admin'), deleteClub);

router.post('/:id/join', protect, joinClub);
router.post('/:id/leave', protect, leaveClub);

module.exports = router;
