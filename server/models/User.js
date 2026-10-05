import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: String,
    picture: String,
    refreshToken: String, // encrypt at rest in production
    lastSyncAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
