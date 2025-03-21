import { Request, Response } from 'express';
import StepEntry from '../models/StepEntry';
import User from '../models/User';
import Team from '../models/Team';
import Challenge from '../models/Challenge';

// @desc    Register steps
// @route   POST /api/steps
// @access  Private
export const registerSteps = async (req: Request, res: Response): Promise<void> => {
  try {
    const entries = req.body; // Array of step entries
    const userId = req.user._id;

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is in a team
    if (!user.teamId) {
      res.status(400).json({ 
        message: 'User must be part of a team to register steps' 
      });
      return;
    }

    const team = await Team.findById(user.teamId);
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    const challenge = await Challenge.findById(team.challenge);
    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }

    // Check if challenge is active
    if (!challenge.isActive) {
      res.status(400).json({ 
        message: 'Cannot register steps for an inactive challenge' 
      });
      return;
    }

    // Process step entries
    const savedEntries = [];
    const errors = [];
    let totalStepsAdded = 0;

    for (const entry of entries) {
      const { date, steps } = entry;
      
      // Validate date is not older than challenge start date
      const entryDate = new Date(date);
      const challengeStartDate = new Date(challenge.startDate);
      const challengeEndDate = new Date(challenge.endDate);
      const currentDate = new Date();
      
      if (entryDate < challengeStartDate) {
        errors.push({
          date,
          error: 'Date is before challenge start date'
        });
        continue;
      }
      
      if (entryDate > challengeEndDate) {
        errors.push({
          date,
          error: 'Date is after challenge end date'
        });
        continue;
      }
      
      if (entryDate > currentDate) {
        errors.push({
          date,
          error: 'Cannot register steps for future dates'
        });
        continue;
      }

      try {
        // Check if entry already exists for this date and user
        const existingEntry = await StepEntry.findOne({
          user: userId,
          date: {
            $gte: new Date(entryDate.setHours(0, 0, 0, 0)),
            $lt: new Date(entryDate.setHours(23, 59, 59, 999))
          }
        });

        if (existingEntry) {
          // Update existing entry
          const oldSteps = existingEntry.steps;
          existingEntry.steps = steps;
          await existingEntry.save();
          
          // Calculate difference for team total
          totalStepsAdded += steps - oldSteps;
          
          savedEntries.push(existingEntry);
        } else {
          // Create new entry
          const newEntry = await StepEntry.create({
            user: userId,
            team: user.teamId,
            challenge: team.challenge,
            date: date,
            steps: steps
          });
          
          totalStepsAdded += steps;
          savedEntries.push(newEntry);
        }
      } catch (error) {
        console.error('Error processing entry:', error);
        errors.push({
          date,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Update team's total steps
    if (totalStepsAdded !== 0) {
      team.totalSteps += totalStepsAdded;
      await team.save();
    }

    res.status(201).json({
      message: 'Steps registered successfully',
      savedEntries,
      errors: errors.length > 0 ? errors : undefined,
      teamTotalSteps: team.totalSteps
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Get user steps
// @route   GET /api/steps/user
// @access  Private
export const getUserSteps = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    let query: any = { user: userId };

    // Add date filtering if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
    }

    const steps = await StepEntry.find(query).sort({ date: -1 });
    
    res.json(steps);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};

// @desc    Get team steps
// @route   GET /api/steps/team/:teamId
// @access  Private
export const getTeamSteps = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    let query: any = { team: teamId };

    // Add date filtering if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
    }

    // Get total steps per date
    const stepsPerDate = await StepEntry.aggregate([
      { $match: query },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalSteps: { $sum: '$steps' },
          entries: { $push: { user: '$user', steps: '$steps' } }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      teamId,
      teamName: team.name,
      totalSteps: team.totalSteps,
      dailySteps: stepsPerDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Server error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
};
