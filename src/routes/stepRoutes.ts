import express from 'express';
import {
  registerSteps,
  getUserSteps,
  getTeamSteps
} from '../controllers/stepController';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/steps
// @desc    Register steps
// @access  Private
router.post('/', protect, registerSteps);

// @route   GET /api/steps/user
// @desc    Get user steps
// @access  Private
router.get('/user', protect, getUserSteps);

// @route   GET /api/steps/team/:teamId
// @desc    Get team steps
// @access  Private
router.get('/team/:teamId', protect, getTeamSteps);

export default router;
