import mongoose, { Document, Schema } from 'mongoose';

export interface IChallenge extends Document {
  name: string;
  description: string;
  startLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  endLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  totalDistance: number; // in kilometers
  totalSteps: number;
  conversionRate: number; // steps per kilometer
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  teams: mongoose.Types.ObjectId[];
  milestones?: {
    name: string;
    description?: string;
    stepsRequired: number;
    latitude: number;
    longitude: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const challengeSchema = new Schema<IChallenge>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    startLocation: {
      name: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    endLocation: {
      name: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    totalDistance: {
      type: Number,
      required: true,
    },
    totalSteps: {
      type: Number,
      required: true,
    },
    conversionRate: {
      type: Number,
      required: true,
      default: 1300, // Default: 1300 steps per km
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    minTeamSize: {
      type: Number,
      required: true,
      default: 1,
    },
    maxTeamSize: {
      type: Number,
      required: true,
    },
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    milestones: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        stepsRequired: {
          type: Number,
          required: true,
        },
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);
export default Challenge;
