import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User';
import Team from '../models/Team';
import Challenge from '../models/Challenge';
import connectDB from '../config/database';

// Load environment variables
dotenv.config();

// Function to seed the database
const seedDatabase = async (): Promise<void> => {
  try {
    // Connect to the database
    await connectDB();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Challenge.deleteMany({});
    
    // Create a challenge
    console.log('Creating challenge...');
    const challenge = await Challenge.create({
      name: 'London to Edinburgh Challenge',
      description: 'Walk from London to Edinburgh virtually',
      startLocation: {
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278
      },
      endLocation: {
        name: 'Edinburgh',
        latitude: 55.9533,
        longitude: -3.1883
      },
      totalDistance: 534, // kilometers
      totalSteps: 534 * 1500, // assuming 1500 steps per kilometer
      conversionRate: 1500, // steps per kilometer
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-04-30'),
      isActive: true,
      minTeamSize: 3,
      maxTeamSize: 6,
      teams: [],
      milestones: [
        {
          name: 'Birmingham',
          description: 'Reached Birmingham',
          stepsRequired: 163 * 1500, // 163 km from London
          latitude: 52.4862,
          longitude: -1.8904
        },
        {
          name: 'Manchester',
          description: 'Reached Manchester',
          stepsRequired: 263 * 1500, // 263 km from London
          latitude: 53.4808,
          longitude: -2.2426
        },
        {
          name: 'Leeds',
          description: 'Reached Leeds',
          stepsRequired: 315 * 1500, // 315 km from London
          latitude: 53.8008,
          longitude: -1.5491
        }
      ]
    });

    // Create teams
    console.log('Creating teams...');
    const teamA = await Team.create({
      name: 'Team Alpha',
      description: 'First team to participate',
      challenge: challenge._id,
      totalSteps: 0,
      members: []
    });

    const teamB = await Team.create({
      name: 'Team Beta',
      description: 'Second team to participate',
      challenge: challenge._id,
      totalSteps: 0,
      members: []
    });

    // Update challenge with teams
    challenge.teams = [teamA._id as mongoose.Types.ObjectId, teamB._id as mongoose.Types.ObjectId];
    await challenge.save();

    // Create users with hashed passwords
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@devoteam.com',
      password: await bcrypt.hash('password123', salt),
      isAdmin: true
    });

    const userA1 = await User.create({
      username: 'user1',
      email: 'user1@devoteam.com',
      password: await bcrypt.hash('password123', salt),
      isAdmin: false,
      teamId: teamA._id
    });

    const userA2 = await User.create({
      username: 'user2',
      email: 'user2@devoteam.com',
      password: await bcrypt.hash('password123', salt),
      isAdmin: false,
      teamId: teamA._id
    });

    const userB1 = await User.create({
      username: 'user3',
      email: 'user3@devoteam.com',
      password: await bcrypt.hash('password123', salt),
      isAdmin: false,
      teamId: teamB._id
    });

    const userB2 = await User.create({
      username: 'user4',
      email: 'user4@devoteam.com',
      password: await bcrypt.hash('password123', salt),
      isAdmin: false,
      teamId: teamB._id
    });

    // Update teams with members
    teamA.members = [userA1._id as mongoose.Types.ObjectId, userA2._id as mongoose.Types.ObjectId];
    await teamA.save();

    teamB.members = [userB1._id as mongoose.Types.ObjectId, userB2._id as mongoose.Types.ObjectId];
    await teamB.save();

    console.log('Database seeded successfully');
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from the database');
    
  } catch (error) {
    console.error(`Error seeding database: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
