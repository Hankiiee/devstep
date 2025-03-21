import { Request, Response } from 'express';
import StepEntry from '../models/StepEntry';
import User from '../models/User';
import Team from '../models/Team';
import Challenge from '../models/Challenge';

// @desc    Get user statistics
// @route   GET /api/statistics/user
// @access  Private
export const getUserStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    
    // Get user's steps
    const steps = await StepEntry.find({ user: userId }).sort({ date: 1 });
    
    if (steps.length === 0) {
      res.json({
        totalSteps: 0,
        averageStepsPerDay: 0,
        dailySteps: []
      });
      return;
    }
    
    // Calculate total steps
    const totalSteps = steps.reduce((sum, entry) => sum + entry.steps, 0);
    
    // Group steps by date
    const dailySteps = steps.map(entry => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      steps: entry.steps
    }));
    
    // Calculate average steps per day
    const averageStepsPerDay = Math.round(totalSteps / dailySteps.length);
    
    res.json({
      totalSteps,
      averageStepsPerDay,
      dailySteps
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Get team statistics
// @route   GET /api/statistics/team/:teamId
// @access  Private
export const getTeamStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    
    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }
    
    // Get all steps for the team
    const steps = await StepEntry.find({ team: teamId }).sort({ date: 1 });
    
    if (steps.length === 0) {
      res.json({
        teamId,
        teamName: team.name,
        totalSteps: 0,
        averageStepsPerDay: 0,
        dailySteps: []
      });
      return;
    }
    
    // Group steps by date
    const stepsByDate = steps.reduce((acc, entry) => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += entry.steps;
      return acc;
    }, {} as Record<string, number>);
    
    const dailySteps = Object.entries(stepsByDate).map(([date, steps]) => ({
      date,
      steps
    }));
    
    // Calculate average steps per day
    const averageStepsPerDay = Math.round(team.totalSteps / dailySteps.length);
    
    res.json({
      teamId,
      teamName: team.name,
      totalSteps: team.totalSteps,
      averageStepsPerDay,
      dailySteps
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Get challenge statistics
// @route   GET /api/statistics/challenge/:challengeId
// @access  Private
export const getChallengeStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeId } = req.params;
    
    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }
    
    // Get all teams in the challenge
    const teams = await Team.find({ challenge: challengeId });
    
    if (teams.length === 0) {
      res.json({
        challengeId,
        challengeName: challenge.name,
        totalSteps: 0,
        teamStatistics: []
      });
      return;
    }
    
    // Calculate total steps across all teams
    const totalSteps = teams.reduce((sum, team) => sum + team.totalSteps, 0);
    
    // Calculate statistics for each team
    const teamStatistics = await Promise.all(
      teams.map(async (team) => {
        // Get all steps for this team
        const steps = await StepEntry.find({ team: team._id }).sort({ date: 1 });
        
        if (steps.length === 0) {
          return {
            teamId: team._id,
            teamName: team.name,
            totalSteps: team.totalSteps,
            percentOfGoal: (team.totalSteps / challenge.totalSteps) * 100,
            averageStepsPerDay: 0,
            dailySteps: []
          };
        }
        
        // Group steps by date
        const stepsByDate = steps.reduce((acc, entry) => {
          const date = new Date(entry.date).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += entry.steps;
          return acc;
        }, {} as Record<string, number>);
        
        const dailySteps = Object.entries(stepsByDate).map(([date, steps]) => ({
          date,
          steps
        }));
        
        // Calculate average steps per day
        const averageStepsPerDay = Math.round(team.totalSteps / dailySteps.length);
        
        return {
          teamId: team._id,
          teamName: team.name,
          totalSteps: team.totalSteps,
          percentOfGoal: (team.totalSteps / challenge.totalSteps) * 100,
          averageStepsPerDay,
          dailySteps
        };
      })
    );
    
    // Sort teams by total steps (descending)
    teamStatistics.sort((a, b) => b.totalSteps - a.totalSteps);
    
    res.json({
      challengeId,
      challengeName: challenge.name,
      totalSteps,
      goalSteps: challenge.totalSteps,
      percentComplete: (totalSteps / challenge.totalSteps) * 100,
      teamStatistics
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};
