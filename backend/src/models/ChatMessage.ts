import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  appointmentId: mongoose.Types.ObjectId;
  senderType: string;
  patientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  senderType: { type: String, required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
  therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false }
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

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
