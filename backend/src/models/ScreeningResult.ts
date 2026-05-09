import mongoose, { Schema, Document } from 'mongoose';

export interface IScreeningResult extends Document {
  patientId: mongoose.Types.ObjectId;
  inputText: string;
  predictedCategory: string;
  createdAt: Date;
}

const ScreeningResultSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
  inputText: { type: String, required: true },
  predictedCategory: { type: String, required: true }
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

export default mongoose.model<IScreeningResult>('ScreeningResult', ScreeningResultSchema);
