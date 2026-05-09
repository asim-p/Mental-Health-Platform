import mongoose, { Schema } from 'mongoose';

const TherapistProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: [{ type: String }],
  qualifications: [{ type: String }],
  yearsOfExperience: { type: Number, default: 0 },
  bio: { type: String },
  hourlyRate: { type: Number, default: 1500 },
  gender: { type: String },
  languages: [{ type: String, default: 'Nepali' }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, default: 'PENDING' },
  credentials: { type: String },
  licenseNumber: { type: String },
  zoomUserId: { type: String }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model('TherapistProfile', TherapistProfileSchema);
