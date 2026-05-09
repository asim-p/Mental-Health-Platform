import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import PatientProfile from '../models/PatientProfile.js';
import Payment from '../models/Payment.js';
import TherapistProfile from '../models/TherapistProfile.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { createHmac } from 'crypto';

const router = Router();

router.post('/initiate', authenticate, async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('therapistId').populate('paymentId').lean();

    if (!appointment) throw createError('Appointment not found', 404);

    const patientProfile = await PatientProfile.findOne({ user: req.user.id });

    if (appointment.patientId.toString() !== patientProfile?._id.toString()) {
      throw createError('Not authorized', 403);
    }

    if (appointment.paymentId?.status === 'COMPLETED') {
      throw createError('Payment already completed', 400);
    }

    const therapistProfile = await TherapistProfile.findById(appointment.therapistId);
    const amount = Number(therapistProfile?.hourlyRate || 0);
    const uuid = `MHP${Date.now()}`;

    const signaturePayload = `merchant_id=MHP001|merchant_key=MHP001_KEY|total_amount=${amount}|transaction_uuid=${uuid}`;
    const signature = createHmac('sha256', 'MHP001_SECRET')
      .update(signaturePayload)
      .digest('base64');

    res.json({
      success: true,
      data: {
        paymentUrl: 'https://uat.esewa.com.np/epay/main',
        params: {
          amt: amount,
          txAmt: 0,
          psc: 0,
          pdc: 0,
          scd: 'MHP001',
          pid: uuid,
          su: `${process.env.FRONTEND_URL}/payment/success`,
          fu: `${process.env.FRONTEND_URL}/payment/failure`,
          signature,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const {
      amt,
      refId,
      pid,
      status,
      transaction_uuid,
    } = req.body;

    if (status !== 'success') {
      throw createError('Payment failed', 400);
    }

    const payment = await Payment.findOne({ transactionId: transaction_uuid });

    if (!payment) throw createError('Payment not found', 404);

    if (Number(amt) !== Number(payment.amount)) {
      throw createError('Amount mismatch', 400);
    }

    payment.status = 'COMPLETED';
    payment.esewaRefId = refId;
    payment.esewaTimestamp = new Date();
    payment.transactionId = transaction_uuid;
    await payment.save();

    await Appointment.findByIdAndUpdate(payment.appointmentId, { status: 'CONFIRMED' });

    res.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:appointmentId', authenticate, async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const payment = await Payment.findOne({ appointmentId });

    if (!payment) throw createError('Payment not found', 404);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refund/:appointmentId', authenticate, async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const payment = await Payment.findOne({ appointmentId });

    if (!payment) throw createError('Payment not found', 404);

    if (payment.status !== 'COMPLETED') {
      throw createError('Payment not eligible for refund', 400);
    }

    payment.status = 'REFUNDED';
    await payment.save();

    await Appointment.findByIdAndUpdate(appointmentId, { status: 'CANCELLED' });

    res.json({
      success: true,
      message: 'Refund initiated successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
