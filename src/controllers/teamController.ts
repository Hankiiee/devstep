import { Request, Response } from 'express';
import Team from '../models/Team';
import User from '../models/User';
import Challenge from '../models/Challenge';
import mongoose from 'mongoose';

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, challenge } = req.body;

    // Verify challenge exists
    const challengeExists = await Challenge.findById(challenge);
    if (!challengeExists) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    // Create new team
    const team = await Team.create({
      name,
      description,
      challenge,
      members: [],
      totalSteps: 0,
    });

    // Add team to challenge
    challengeExists.teams.push(team._id as unknown as mongoose.Types.ObjectId);
    await challengeExists.save();

    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find({}).populate('members', 'username email');
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
export const getTeamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'username email')
      .populate('challenge');

    if (team) {
      res.json(team);
    } else {
      res.status(404).json({ message: 'Team not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Add a member to a team
// @route   POST /api/teams/:id/members
// @access  Private
export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const teamId = req.params.id;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is already in a team
    if (user.teamId) {
      const currentTeam = await Team.findById(user.teamId);
      if (currentTeam) {
        res.status(409).json({ 
          message: `User is already a member of team '${currentTeam.name}'` 
        });
        return;
      }
    }

    // Get challenge details for team size validation
    const challenge = await Challenge.findById(team.challenge);
    if (!challenge) {
      res.status(404).json({ message: 'Associated challenge not found' });
      return;
    }

    // Check if team has reached maximum size
    if (team.members.length >= challenge.maxTeamSize) {
      res.status(400).json({ 
        message: `Team is already at maximum capacity (${challenge.maxTeamSize})` 
      });
      return;
    }

    // Add user to team
    if (!team.members.some(member => member.toString() === (user._id as mongoose.Types.ObjectId).toString())) {
      team.members.push(user._id as unknown as mongoose.Types.ObjectId);
      await team.save();

      // Update user's team reference
      user.teamId = team._id as unknown as mongoose.Types.ObjectId;
      await user.save();

      res.status(200).json({ 
        message: `User ${user.username} added to team ${team.name}`,
        team
      });
    } else {
      res.status(409).json({ message: 'User is already a member of this team' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Remove a member from a team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const teamId = req.params.id;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is in the team
    if (!team.members.some(member => member.toString() === userId)) {
      res.status(404).json({ message: 'User is not a member of this team' });
      return;
    }

    // Remove user from team
    team.members = team.members.filter(
      (member) => member.toString() !== userId.toString()
    );
    await team.save();

    // Remove team reference from user
    user.teamId = undefined;
    await user.save();

    res.status(200).json({ 
      message: `User ${user.username} removed from team ${team.name}`,
      team
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};
