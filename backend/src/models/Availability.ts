import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailability extends Document {
  therapistId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const AvailabilitySchema: Schema = new Schema({
  therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
  dayOfWeek: { type: Number, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
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

export default mongoose.model<IAvailability>('Availability', AvailabilitySchema);
