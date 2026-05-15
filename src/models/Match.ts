import mongoose, { Document, Schema } from 'mongoose';

export type MatchStatus = 'requested' | 'accepted' | 'rejected' | 'complete';

export interface IMatchDocument extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: MatchStatus;
  createdAt: Date;
}

const MatchSchema = new Schema<IMatchDocument>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'complete'],
      default: 'requested',
    },
  },
  { timestamps: true }
);

MatchSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export default mongoose.model<IMatchDocument>('Match', MatchSchema);
