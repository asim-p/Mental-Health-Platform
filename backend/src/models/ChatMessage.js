import mongoose, { Schema } from 'mongoose';

const ChatMessageSchema = new Schema({
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
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model('ChatMessage', ChatMessageSchema);
