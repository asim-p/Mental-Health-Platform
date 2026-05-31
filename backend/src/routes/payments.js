import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import PatientProfile from '../models/PatientProfile.js';
import Payment from '../models/Payment.js';
import TherapistProfile from '../models/TherapistProfile.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { createHmac } from 'crypto';
import { createZoomMeeting } from '../services/zoom.js';
import { createNotification } from '../services/notification.js';

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

    const payment = await Payment.findOneAndUpdate(
      { appointmentId },
      {
        amount,
        paymentMethod: 'esewa',
        transactionId: uuid,
        status: 'PENDING'
      },
      { upsert: true, new: true }
    );

    await Appointment.findByIdAndUpdate(appointmentId, { paymentId: payment._id });

    const signaturePayload = `total_amount=${amount},transaction_uuid=${uuid},product_code=EPAYTEST`;
    const signature = createHmac('sha256', '8gBm/:&EnhH.1/q')
      .update(signaturePayload)
      .digest('base64');

    res.json({
      success: true,
      data: {
        paymentUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        params: {
          amount: amount,
          tax_amount: 0,
          total_amount: amount,
          transaction_uuid: uuid,
          product_code: 'EPAYTEST',
          product_delivery_charge: 0,
          product_service_charge: 0,
          success_url: `${process.env.FRONTEND_URL}/payment/success`,
          failure_url: `${process.env.FRONTEND_URL}/payment/failure`,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
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
    const { data } = req.body;

    if (!data) {
      throw createError('Missing payload data', 400);
    }

    // Decode base64 string
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const parsedData = JSON.parse(decodedData);

    const {
      status,
      transaction_uuid,
      total_amount,
      transaction_code
    } = parsedData;

    if (status !== 'COMPLETE') {
      throw createError('Payment failed or cancelled', 400);
    }

    const payment = await Payment.findOne({ transactionId: transaction_uuid });

    if (!payment) throw createError('Payment not found', 404);

    if (Number(total_amount.replace(/,/g, '')) !== Number(payment.amount)) {
      throw createError('Amount mismatch', 400);
    }

    payment.status = 'COMPLETED';
    payment.esewaRefId = transaction_code;
    payment.esewaTimestamp = new Date();
    await payment.save();

    const appointment = await Appointment.findById(payment.appointmentId).populate({
      path: 'patientId',
      populate: { path: 'user', select: 'firstName lastName' }
    });

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    const patientName = appointment.patientId?.user
      ? `${appointment.patientId.user.firstName} ${appointment.patientId.user.lastName}`
      : 'Patient';

    appointment.status = 'PAID';
    await appointment.save();

    const paidDate = new Date(appointment.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // Notify the therapist that payment was received
    const therapistDoc = await TherapistProfile.findById(appointment.therapistId);
    if (therapistDoc) {
      await createNotification({
        userId: therapistDoc.user,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: `Payment of NPR ${payment.amount} has been received for the appointment on ${paidDate}. Please confirm the session.`,
        appointmentId: appointment._id,
      });
    }

    // Notify the patient that payment was successful
    if (appointment.patientId?.user?._id) {
      await createNotification({
        userId: appointment.patientId.user._id,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Successful',
        message: `Your payment of NPR ${payment.amount} was received. Awaiting therapist confirmation for ${paidDate}.`,
        appointmentId: appointment._id,
      });
    }

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
