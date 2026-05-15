import mongoose, { Document, Schema } from 'mongoose';

export interface IConnectCode extends Document {
  userId: mongoose.Types.ObjectId;
  code: string;
  expiresAt: Date;
}

const ConnectCodeSchema = new Schema<IConnectCode>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// MongoDB TTL index — auto-deletes expired docs
ConnectCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IConnectCode>('ConnectCode', ConnectCodeSchema);
