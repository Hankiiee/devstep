import { Request, Response } from 'express';
import Challenge from '../models/Challenge';
import Team from '../models/Team';

// Helper function to calculate position based on steps
const calculatePositionOnLine = (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  progress: number
) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(1, Math.max(0, progress));
  
  // Calculate the position along the straight line
  const newLat = startLat + (endLat - startLat) * clampedProgress;
  const newLng = startLng + (endLng - startLng) * clampedProgress;
  
  return { latitude: newLat, longitude: newLng };
};

// @desc    Get map view data for a challenge
// @route   GET /api/map/:challengeId
// @access  Private
export const getMapData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeId } = req.params;
    
    // Find the challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }
    
    // Get all teams for this challenge
    const teams = await Team.find({ challenge: challengeId });
    
    // Calculate progress for each team
    const teamsData = teams.map(team => {
      // Calculate progress as a percentage of the total steps
      const progressPercent = Math.min(1, team.totalSteps / challenge.totalSteps);
      
      // Calculate distance covered in kilometers
      const distanceCovered = progressPercent * challenge.totalDistance;
      
      // Calculate current position on the map
      const position = calculatePositionOnLine(
        challenge.startLocation.latitude,
        challenge.startLocation.longitude,
        challenge.endLocation.latitude,
        challenge.endLocation.longitude,
        progressPercent
      );
      
      return {
        teamId: team._id,
        teamName: team.name,
        totalSteps: team.totalSteps,
        progressPercent: progressPercent * 100, // Convert to percentage
        distanceCovered,
        position
      };
    });
    
    // Sort teams by progress (descending)
    teamsData.sort((a, b) => b.progressPercent - a.progressPercent);
    
    // Prepare milestone data
    const milestones = challenge.milestones?.map(milestone => {
      // Calculate milestone position as a percentage of the challenge
      const milestoneProgress = milestone.stepsRequired / challenge.totalSteps;
      
      // Calculate position on the map
      const position = calculatePositionOnLine(
        challenge.startLocation.latitude,
        challenge.startLocation.longitude,
        challenge.endLocation.latitude,
        challenge.endLocation.longitude,
        milestoneProgress
      );
      
      return {
        name: milestone.name,
        description: milestone.description,
        stepsRequired: milestone.stepsRequired,
        progressPercent: milestoneProgress * 100,
        position
      };
    }) || [];
    
    res.json({
      challengeId,
      challengeName: challenge.name,
      startLocation: challenge.startLocation,
      endLocation: challenge.endLocation,
      totalDistance: challenge.totalDistance,
      totalSteps: challenge.totalSteps,
      teams: teamsData,
      milestones
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};
