import { Router, Response } from 'express';
import Appointment, { AppointmentStatus } from '../models/Appointment.js';
import PatientProfile from '../models/PatientProfile.js';
import TherapistProfile from '../models/TherapistProfile.js';
import Payment from '../models/Payment.js';
import ChatMessage from '../models/ChatMessage.js';
import Review from '../models/Review.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, upcoming } = req.query;

    let where: any = {};

    if (req.user!.role === 'PATIENT') {
      const profile = await PatientProfile.findOne({ user: req.user!.id });
      where.patientId = profile?._id;
    } else if (req.user!.role === 'THERAPIST') {
      const profile = await TherapistProfile.findOne({ user: req.user!.id });
      where.therapistId = profile?._id;
    }

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.scheduledAt = { $gte: new Date() };
    }

    const appointments = await Appointment.find(where)
      .populate({
        path: 'patientId',
        populate: { path: 'user', select: 'firstName lastName email' }
      })
      .populate({
        path: 'therapistId',
        populate: { path: 'user', select: 'firstName lastName email' }
      })
      .populate('paymentId')
      .sort({ scheduledAt: upcoming === 'true' ? 1 : -1 })
      .lean();

    const mappedAppointments = appointments.map((a: any) => {
       a.id = a._id.toString();
       if(a.patientId) {
           a.patient = a.patientId;
           a.patient.id = a.patient._id.toString();
           if(a.patient.user) a.patient.user.id = a.patient.user._id.toString();
           delete a.patientId;
       }
       if(a.therapistId) {
           a.therapist = a.therapistId;
           a.therapist.id = a.therapist._id.toString();
           if(a.therapist.user) a.therapist.user.id = a.therapist.user._id.toString();
           delete a.therapistId;
       }
       if(a.paymentId) {
           a.payment = a.paymentId;
           a.payment.id = a.payment._id.toString();
           delete a.paymentId;
       }
       return a;
    });

    res.json({
      success: true,
      data: mappedAppointments,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const appointment: any = await Appointment.findById(id)
      .populate({
        path: 'patientId',
        populate: { path: 'user', select: 'firstName lastName email' }
      })
      .populate({
        path: 'therapistId',
        populate: { path: 'user', select: 'firstName lastName email phone' }
      })
      .populate('paymentId')
      .lean();

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    appointment.id = appointment._id.toString();
    if(appointment.patientId) {
       appointment.patient = appointment.patientId;
       appointment.patient.id = appointment.patient._id.toString();
       if(appointment.patient.user) appointment.patient.user.id = appointment.patient.user._id.toString();
       delete appointment.patientId;
    }
    if(appointment.therapistId) {
       appointment.therapist = appointment.therapistId;
       appointment.therapist.id = appointment.therapist._id.toString();
       if(appointment.therapist.user) appointment.therapist.user.id = appointment.therapist.user._id.toString();
       delete appointment.therapistId;
    }
    if(appointment.paymentId) {
       appointment.payment = appointment.paymentId;
       appointment.payment.id = appointment.payment._id.toString();
       delete appointment.paymentId;
    }

    appointment.chatMessages = await ChatMessage.find({ appointmentId: appointment._id }).sort({ createdAt: 1 }).lean();

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

    const patientProfile = await PatientProfile.findOne({ user: req.user!.id });
    if (!patientProfile) {
      throw createError('Patient profile not found', 404);
    }

    const therapistProfile = await TherapistProfile.findById(data.therapistId).populate('user');
    if (!therapistProfile) {
      throw createError('Therapist not found', 404);
    }

    if (!therapistProfile.isVerified) {
      throw createError('Therapist is not verified', 400);
    }

    const existingAppointment = await Appointment.findOne({
      therapistId: data.therapistId,
      scheduledAt: new Date(data.scheduledAt),
      status: { $ne: AppointmentStatus.CANCELLED },
    });

    if (existingAppointment) {
      throw createError('This time slot is already booked', 400);
    }

    const appointment = new Appointment({
      patientId: patientProfile._id,
      therapistId: therapistProfile._id,
      scheduledAt: new Date(data.scheduledAt),
      notes: data.notes,
      aiPrediction: data.aiPrediction,
      status: 'PENDING',
    });
    
    const payment = new Payment({
      appointmentId: appointment._id,
      amount: therapistProfile.hourlyRate,
      status: 'PENDING',
    });
    await payment.save();

    appointment.paymentId = payment._id;
    await appointment.save();

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

    const appointment = await Appointment.findByIdAndUpdate(id, {
        status: 'CONFIRMED',
        zoomMeetingUrl: `https://zoom.us/j/${uuidv4().replace(/-/g, '').substring(0, 10)}`,
        zoomJoinUrl: `https://zoom.us/j/${uuidv4().replace(/-/g, '').substring(0, 10)}`,
    }, { new: true });

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

    const appointment = await Appointment.findByIdAndUpdate(id, { status: 'COMPLETED' }, { new: true });

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

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    const patientProfile = await PatientProfile.findOne({ user: req.user!.id });
    const therapistProfile = await TherapistProfile.findOne({ user: req.user!.id });

    const isPatient = appointment.patientId.toString() === patientProfile?._id.toString();
    const isTherapist = appointment.therapistId.toString() === therapistProfile?._id.toString();

    if (!isPatient && !isTherapist && req.user!.role !== 'ADMIN') {
      throw createError('Not authorized to cancel this appointment', 403);
    }

    appointment.status = 'CANCELLED' as any;
    appointment.notes = reason ? `${appointment.notes || ''}\nCancellation reason: ${reason}` : appointment.notes;
    await appointment.save();

    if (appointment.paymentId) {
        await Payment.findByIdAndUpdate(appointment.paymentId, { status: 'REFUNDED' });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/review', authenticate, authorize('PATIENT'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment || appointment.status !== 'COMPLETED') {
      throw createError('Cannot review incomplete appointment', 400);
    }

    const patientProfile = await PatientProfile.findOne({ user: req.user!.id });

    if (appointment.patientId.toString() !== patientProfile?._id.toString()) {
      throw createError('Not authorized to review this appointment', 403);
    }

    const existingReview = await Review.findOne({ appointmentId: id });

    if (existingReview) {
      throw createError('Already reviewed this appointment', 400);
    }

    const review = new Review({
      appointmentId: id,
      therapistId: appointment.therapistId,
      patientId: patientProfile!._id,
      rating,
      comment,
    });
    
    await review.save();

    const therapistProfile = await TherapistProfile.findById(appointment.therapistId);

    if (therapistProfile) {
      const totalRating = therapistProfile.rating * therapistProfile.reviewCount + rating;
      const newReviewCount = therapistProfile.reviewCount + 1;

      therapistProfile.rating = totalRating / newReviewCount;
      therapistProfile.reviewCount = newReviewCount;
      await therapistProfile.save();
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
