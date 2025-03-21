import express from 'express';
import { getMapData } from '../controllers/mapController';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/map/:challengeId
// @desc    Get map view data for a challenge
// @access  Private
router.get('/:challengeId', protect, getMapData);

export default router;
