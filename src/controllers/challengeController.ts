import { Request, Response } from 'express';
import Challenge from '../models/Challenge';
import Team from '../models/Team';

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private/Admin
export const createChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      startLocation,
      endLocation,
      totalDistance,
      conversionRate,
      startDate,
      endDate,
      minTeamSize,
      maxTeamSize,
      milestones,
    } = req.body;

    // Calculate total steps
    const totalSteps = totalDistance * conversionRate;

    const challenge = await Challenge.create({
      name,
      description,
      startLocation,
      endLocation,
      totalDistance,
      totalSteps,
      conversionRate,
      startDate,
      endDate,
      minTeamSize,
      maxTeamSize,
      milestones: milestones || [],
    });

    if (challenge) {
      res.status(201).json(challenge);
    } else {
      res.status(400).json({ message: 'Invalid challenge data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
export const getChallenges = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenges = await Challenge.find({});
    res.json(challenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Get challenge by ID
// @route   GET /api/challenges/:id
// @access  Private
export const getChallengeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate({
        path: 'teams',
        populate: {
          path: 'members',
          select: 'username email'
        }
      });

    if (challenge) {
      res.json(challenge);
    } else {
      res.status(404).json({ message: 'Challenge not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private/Admin
export const updateChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    // Update fields if provided in request
    if (req.body.name) challenge.name = req.body.name;
    if (req.body.description) challenge.description = req.body.description;
    if (req.body.startLocation) challenge.startLocation = req.body.startLocation;
    if (req.body.endLocation) challenge.endLocation = req.body.endLocation;
    
    if (req.body.totalDistance) {
      challenge.totalDistance = req.body.totalDistance;
      // Recalculate total steps if distance changes
      const conversionRate = req.body.conversionRate || challenge.conversionRate;
      challenge.totalSteps = req.body.totalDistance * conversionRate;
    }
    
    if (req.body.conversionRate) {
      challenge.conversionRate = req.body.conversionRate;
      // Recalculate total steps if conversion rate changes
      challenge.totalSteps = challenge.totalDistance * req.body.conversionRate;
    }
    
    if (req.body.startDate) challenge.startDate = req.body.startDate;
    if (req.body.endDate) challenge.endDate = req.body.endDate;
    if (req.body.isActive !== undefined) challenge.isActive = req.body.isActive;
    if (req.body.minTeamSize) challenge.minTeamSize = req.body.minTeamSize;
    if (req.body.maxTeamSize) challenge.maxTeamSize = req.body.maxTeamSize;
    if (req.body.milestones) challenge.milestones = req.body.milestones;

    const updatedChallenge = await challenge.save();
    res.json(updatedChallenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private/Admin
export const deleteChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    // Check if there are teams associated with this challenge
    const teamsCount = await Team.countDocuments({ challenge: challenge._id });
    
    if (teamsCount > 0) {
      res.status(400).json({ 
        message: 'Cannot delete challenge with associated teams' 
      });
      return;
    }

    await challenge.deleteOne();
    res.json({ message: 'Challenge removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Start or end a challenge
// @route   PUT /api/challenges/:id/toggle-status
// @access  Private/Admin
export const toggleChallengeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    challenge.isActive = !challenge.isActive;
    const updatedChallenge = await challenge.save();

    res.json({
      isActive: updatedChallenge.isActive,
      message: updatedChallenge.isActive 
        ? 'Challenge has been started' 
        : 'Challenge has been ended'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};
