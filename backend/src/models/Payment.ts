import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface IPayment extends Document {
  appointmentId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod?: string;
  transactionId?: string;
  status: PaymentStatus;
  esewaRefId?: string;
  esewaAmount?: string;
  esewaTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'NPR' },
  paymentMethod: { type: String },
  transactionId: { type: String },
  status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
  esewaRefId: { type: String },
  esewaAmount: { type: String },
  esewaTimestamp: { type: Date }
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

export default mongoose.model<IPayment>('Payment', PaymentSchema);
