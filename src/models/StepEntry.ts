import mongoose, { Document, Schema } from 'mongoose';

export interface IStepEntry extends Document {
  user: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  challenge: mongoose.Types.ObjectId;
  date: Date;
  steps: number;
  createdAt: Date;
  updatedAt: Date;
}

const stepEntrySchema = new Schema<IStepEntry>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    steps: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate entries for the same user on the same day
stepEntrySchema.index({ user: 1, date: 1 }, { unique: true });

const StepEntry = mongoose.model<IStepEntry>('StepEntry', stepEntrySchema);
export default StepEntry;
