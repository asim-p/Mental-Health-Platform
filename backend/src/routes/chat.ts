import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { io } from '../index.js';

const prisma = new PrismaClient();
const router = Router();

router.get('/:appointmentId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { userId: req.user!.id },
    });

    const therapistProfile = await prisma.therapistProfile.findFirst({
      where: { userId: req.user!.id },
    });

    const isAuthorized =
      appointment.patientId === patientProfile?.id ||
      appointment.therapistId === therapistProfile?.id ||
      req.user!.role === 'ADMIN';

    if (!isAuthorized) {
      throw createError('Not authorized to view this chat', 403);
    }

    const messages = await prisma.chatMessage.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: messages,
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

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw createError('Appointment not found', 404);
    }

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { userId: req.user!.id },
    });

    const therapistProfile = await prisma.therapistProfile.findFirst({
      where: { userId: req.user!.id },
    });

    const isPatient = patientProfile && appointment.patientId === patientProfile.id;
    const isTherapist = therapistProfile && appointment.therapistId === therapistProfile.id;

    if (!isPatient && !isTherapist) {
      throw createError('Not authorized to send messages', 403);
    }

    const message = await prisma.chatMessage.create({
      data: {
        appointmentId,
        patientId: appointment.patientId,
        therapistId: appointment.therapistId,
        senderType: isPatient ? 'PATIENT' : 'THERAPIST',
        content: content.trim(),
      },
    });

    io.to(`appointment:${appointmentId}`).emit('new_message', message);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:messageId/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
