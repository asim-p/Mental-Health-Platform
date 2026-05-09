import { Router, Response } from 'express';
import Appointment from '../models/Appointment.js';
import PatientProfile from '../models/PatientProfile.js';
import TherapistProfile from '../models/TherapistProfile.js';
import ChatMessage from '../models/ChatMessage.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { io } from '../index.js';

const router = Router();

router.get('/:appointmentId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    const patientProfile = await PatientProfile.findOne({ user: req.user!.id });
    const therapistProfile = await TherapistProfile.findOne({ user: req.user!.id });

    const isAuthorized =
      appointment.patientId.toString() === patientProfile?._id.toString() ||
      appointment.therapistId.toString() === therapistProfile?._id.toString() ||
      req.user!.role === 'ADMIN';

    if (!isAuthorized) {
      throw createError('Not authorized to view this chat', 403);
    }

    const messages = await ChatMessage.find({ appointmentId })
      .sort({ createdAt: 1 })
      .lean();

    const mappedMessages = messages.map((m: any) => {
        m.id = m._id.toString();
        return m;
    });

    res.json({
      success: true,
      data: mappedMessages,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:appointmentId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { appointmentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      throw createError('Message content required', 400);
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    const patientProfile = await PatientProfile.findOne({ user: req.user!.id });
    const therapistProfile = await TherapistProfile.findOne({ user: req.user!.id });

    const isPatient = patientProfile && appointment.patientId.toString() === patientProfile._id.toString();
    const isTherapist = therapistProfile && appointment.therapistId.toString() === therapistProfile._id.toString();

    if (!isPatient && !isTherapist) {
      throw createError('Not authorized to send messages', 403);
    }

    const message = new ChatMessage({
      appointmentId,
      patientId: appointment.patientId,
      therapistId: appointment.therapistId,
      senderType: isPatient ? 'PATIENT' : 'THERAPIST',
      content: content.trim(),
    });
    
    await message.save();

    const messageData: any = message.toObject();
    messageData.id = messageData._id.toString();

    io.to(`appointment:${appointmentId}`).emit('new_message', messageData);

    res.status(201).json({
      success: true,
      data: messageData,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:messageId/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findByIdAndUpdate(messageId, { isRead: true }, { new: true }).lean();

    if(message) {
        (message as any).id = message._id.toString();
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
