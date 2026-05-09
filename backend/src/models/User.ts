import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  PATIENT = 'PATIENT',
  THERAPIST = 'THERAPIST',
  ADMIN = 'ADMIN'
}

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.PATIENT }
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

export default mongoose.model<IUser>('User', UserSchema);
