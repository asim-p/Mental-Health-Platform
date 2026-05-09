import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  appointmentId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
  rating: { type: Number, required: true },
  comment: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: (doc, ret) => {
      (ret as any).id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
    }
  }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
