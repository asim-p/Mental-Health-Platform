import mongoose, { Schema } from 'mongoose';

const TherapistProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: [{ type: String }],
  qualifications: [{ type: String }],
  yearsOfExperience: { type: Number, default: 0 },
  bio: { type: String },
  hourlyRate: { type: Number, default: 1500 },
  gender: { type: String },
  languages: [{ type: String, default: ['Nepali'] }],
  isVerified: { type: Boolean, default: false },
  credentials: { type: String },
  licenseNumber: { type: String },
  zoomUserId: { type: String },
  // Fields for therapist to set their own data
  displayName: { type: String },
  profileImage: { type: String },
  availability: [{
    dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String },
    endTime: { type: String },
    isAvailable: { type: Boolean, default: true }
  }]
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
