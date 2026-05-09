import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface ITherapistProfile extends Document {
  user: mongoose.Types.ObjectId | IUser;
  specialization: string[];
  qualifications: string[];
  yearsOfExperience: number;
  bio?: string;
  hourlyRate: number;
  gender?: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationStatus: string;
  credentials?: string;
  licenseNumber?: string;
  zoomUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TherapistProfileSchema: Schema = new Schema({
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
      (ret as any).id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
    }
  }
});

export default mongoose.model<ITherapistProfile>('TherapistProfile', TherapistProfileSchema);
