import mongoose, { Schema } from 'mongoose';

const ScreeningResultSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
  inputText: { type: String, required: true },
  predictedCategory: { type: String, required: true }
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
