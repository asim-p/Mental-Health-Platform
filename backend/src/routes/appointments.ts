import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, upcoming } = req.query;

    let where: any = {};

    if (req.user!.role === 'PATIENT') {
      const profile = await prisma.patientProfile.findFirst({
        where: { userId: req.user!.id },
      });
      where.patientId = profile?.id;
    } else if (req.user!.role === 'THERAPIST') {
      const profile = await prisma.therapistProfile.findFirst({
        where: { userId: req.user!.id },
      });
      where.therapistId = profile?.id;
    }

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.scheduledAt = { gte: new Date() };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { scheduledAt: upcoming === 'true' ? 'asc' : 'desc' },
    });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        payment: true,
        chatMessages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

const createAppointmentSchema = z.object({
  therapistId: z.string(),
  scheduledAt: z.string(),
  notes: z.string().optional(),
  aiPrediction: z.string().optional(),
});

router.post('/', authenticate, authorize('PATIENT'), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createAppointmentSchema.parse(req.body);

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { userId: req.user!.id },
    });

    if (!patientProfile) {
      throw createError('Patient profile not found', 404);
    }

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id: data.therapistId },
      include: {
        user: true,
      },
    });

    if (!therapistProfile) {
      throw createError('Therapist not found', 404);
    }

    if (!therapistProfile.isVerified) {
      throw createError('Therapist is not verified', 400);
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        therapistId: data.therapistId,
        scheduledAt: new Date(data.scheduledAt),
        status: { not: 'CANCELLED' },
      },
    });

    if (existingAppointment) {
      throw createError('This time slot is already booked', 400);
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        therapistId: therapistProfile.id,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
        aiPrediction: data.aiPrediction,
        status: 'PENDING',
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        amount: therapistProfile.hourlyRate,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/confirm', authenticate, authorize('THERAPIST', 'ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        zoomMeetingUrl: `https://zoom.us/j/${uuidv4().replace(/-/g, '').substring(0, 10)}`,
        zoomJoinUrl: `https://zoom.us/j/${uuidv4().replace(/-/g, '').substring(0, 10)}`,
      },
    });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/complete', authenticate, authorize('THERAPIST'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    const isPatient = appointment.patientId === (await prisma.patientProfile.findFirst({ where: { userId: req.user!.id } }))?.id;
    const isTherapist = appointment.therapistId === (await prisma.therapistProfile.findFirst({ where: { userId: req.user!.id } }))?.id;

    if (!isPatient && !isTherapist && req.user!.role !== 'ADMIN') {
      throw createError('Not authorized to cancel this appointment', 403);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${appointment.notes || ''}\nCancellation reason: ${reason}` : appointment.notes,
      },
    });

    if (appointment.payment) {
      await prisma.payment.update({
        where: { appointmentId: id },
        data: { status: 'REFUNDED' },
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/review', authenticate, authorize('PATIENT'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.status !== 'COMPLETED') {
      throw createError('Cannot review incomplete appointment', 400);
    }

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { userId: req.user!.id },
    });

    if (appointment.patientId !== patientProfile?.id) {
      throw createError('Not authorized to review this appointment', 403);
    }

    const existingReview = await prisma.review.findUnique({
      where: { appointmentId: id },
    });

    if (existingReview) {
      throw createError('Already reviewed this appointment', 400);
    }

    const review = await prisma.review.create({
      data: {
        appointmentId: id,
        therapistId: appointment.therapistId,
        patientId: patientProfile!.id,
        rating,
        comment,
      },
    });

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id: appointment.therapistId },
    });

    if (therapistProfile) {
      const totalRating = therapistProfile.rating * therapistProfile.reviewCount + rating;
      const newReviewCount = therapistProfile.reviewCount + 1;

      await prisma.therapistProfile.update({
        where: { id: appointment.therapistId },
        data: {
          rating: totalRating / newReviewCount,
          reviewCount: newReviewCount,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
