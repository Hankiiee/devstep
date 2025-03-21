import express from 'express';
import {
  createTeam,
  getTeams,
  getTeamById,
  addTeamMember,
  removeTeamMember
} from '../controllers/teamController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/teams
// @desc    Create a new team
// @access  Private/Admin
router.post('/', protect, admin, createTeam);

// @route   GET /api/teams
// @desc    Get all teams
// @access  Private
router.get('/', protect, getTeams);

// @route   GET /api/teams/:id
// @desc    Get team by ID
// @access  Private
router.get('/:id', protect, getTeamById);

// @route   POST /api/teams/:id/members
// @desc    Add member to team
// @access  Private/Admin
router.post('/:id/members', protect, admin, addTeamMember);

// @route   DELETE /api/teams/:id/members/:userId
// @desc    Remove member from team
// @access  Private/Admin
router.delete('/:id/members/:userId', protect, admin, removeTeamMember);

export default router;
