import express from 'express';
import {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  toggleChallengeStatus
} from '../controllers/challengeController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/challenges
// @desc    Create a new challenge
// @access  Private/Admin
router.post('/', protect, admin, createChallenge);

// @route   GET /api/challenges
// @desc    Get all challenges
// @access  Private
router.get('/', protect, getChallenges);

// @route   GET /api/challenges/:id
// @desc    Get challenge by ID
// @access  Private
router.get('/:id', protect, getChallengeById);

// @route   PUT /api/challenges/:id
// @desc    Update challenge
// @access  Private/Admin
router.put('/:id', protect, admin, updateChallenge);

// @route   DELETE /api/challenges/:id
// @desc    Delete challenge
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteChallenge);

// @route   PUT /api/challenges/:id/toggle-status
// @desc    Start or end a challenge
// @access  Private/Admin
router.put('/:id/toggle-status', protect, admin, toggleChallengeStatus);

export default router;
