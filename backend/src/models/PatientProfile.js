import mongoose, { Schema } from 'mongoose';

const PatientProfileSchema = new Schema({
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
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model('PatientProfile', PatientProfileSchema);
