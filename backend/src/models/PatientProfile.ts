import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IPatientProfile extends Document {
  user: mongoose.Types.ObjectId | IUser;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  preferredLanguage: string;
  lastScreeningAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  address: { type: String },
  emergencyContact: { type: String },
  preferredLanguage: { type: String, default: 'Nepali' },
  lastScreeningAt: { type: Date }
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

export default mongoose.model<IPatientProfile>('PatientProfile', PatientProfileSchema);
