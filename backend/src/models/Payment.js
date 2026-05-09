import mongoose, { Schema } from 'mongoose';

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

const PaymentSchema = new Schema({
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
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model('Payment', PaymentSchema);
