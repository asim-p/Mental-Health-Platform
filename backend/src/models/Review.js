import mongoose, { Schema } from 'mongoose';

const ReviewSchema = new Schema({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
  rating: { type: Number, required: true },
  comment: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model('Review', ReviewSchema);
