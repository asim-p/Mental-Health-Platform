import mongoose, { Schema, Document } from 'mongoose';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  duration: number;
  status: AppointmentStatus;
  paymentId?: mongoose.Types.ObjectId;
  zoomMeetingUrl?: string;
  zoomJoinUrl?: string;
  notes?: string;
  aiPrediction?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
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
      (ret as any).id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
    }
  }
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
