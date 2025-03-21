import express from 'express';
import {
  getUserStatistics,
  getTeamStatistics,
  getChallengeStatistics
} from '../controllers/statisticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/statistics/user
// @desc    Get user statistics
// @access  Private
router.get('/user', protect, getUserStatistics);

// @route   GET /api/statistics/team/:teamId
// @desc    Get team statistics
// @access  Private
router.get('/team/:teamId', protect, getTeamStatistics);

// @route   GET /api/statistics/challenge/:challengeId
// @desc    Get challenge statistics
// @access  Private
router.get('/challenge/:challengeId', protect, getChallengeStatistics);

export default router;
