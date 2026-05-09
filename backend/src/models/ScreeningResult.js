import mongoose, { Schema } from 'mongoose';

const ScreeningResultSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
  inputText: { type: String, required: true },
  predictedCategory: { type: String, required: true },
  confidence: { type: Number, default: 0.85 }
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

export default mongoose.model('ScreeningResult', ScreeningResultSchema);
