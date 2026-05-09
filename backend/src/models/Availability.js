import mongoose, { Schema } from 'mongoose';

const AvailabilitySchema = new Schema({
  therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
  dayOfWeek: { type: Number, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
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

export default mongoose.model('Availability', AvailabilitySchema);
