import mongoose, { Schema } from 'mongoose';

export const AppointmentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const AppointmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
  therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.PENDING },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  zoomMeetingUrl: { type: String },
  zoomJoinUrl: { type: String },
  notes: { type: String },
  aiPrediction: { type: String }
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

export default mongoose.model('Appointment', AppointmentSchema);
