import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { createHmac } from 'crypto';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

router.post('/initiate', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        therapist: true,
        payment: true,
      },
    });

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { userId: req.user!.id },
    });

    if (appointment.patientId !== patientProfile?.id) {
      throw createError('Not authorized', 403);
    }

    if (appointment.payment?.status === 'COMPLETED') {
      throw createError('Payment already completed', 400);
    }

    const amount = Number(appointment.therapist.hourlyRate);
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

    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: transaction_uuid,
      },
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (Number(amt) !== Number(payment.amount)) {
      throw createError('Amount mismatch', 400);
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        esewaRefId: refId,
        esewaTimestamp: new Date(),
        transactionId: transaction_uuid,
      },
    });

    await prisma.appointment.update({
      where: { id: payment.appointmentId },
      data: { status: 'CONFIRMED' },
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:appointmentId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { appointmentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { appointmentId },
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refund/:appointmentId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { appointmentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { appointmentId },
    });

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    if (payment.status !== 'COMPLETED') {
      throw createError('Payment not eligible for refund', 400);
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });

    res.json({
      success: true,
      message: 'Refund initiated successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
