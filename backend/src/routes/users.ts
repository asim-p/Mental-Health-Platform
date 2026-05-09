import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

router.get('/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        patientProfile: true,
        therapistProfile: {
          include: {
            availability: true,
          },
        },
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          profile: user.patientProfile || user.therapistProfile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  profileData: z.object({
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    preferredLanguage: z.string().optional(),
  }).optional(),
});

router.patch('/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      include: {
        patientProfile: true,
        therapistProfile: true,
      },
    });

    if (user.role === 'PATIENT' && user.patientProfile && data.profileData) {
      await prisma.patientProfile.update({
        where: { id: user.patientProfile.id },
        data: {
          dateOfBirth: data.profileData.dateOfBirth ? new Date(data.profileData.dateOfBirth) : undefined,
          gender: data.profileData.gender,
          address: data.profileData.address,
          emergencyContact: data.profileData.emergencyContact,
          preferredLanguage: data.profileData.preferredLanguage,
        },
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/patients', authenticate, authorize('ADMIN', 'THERAPIST'), async (req: AuthRequest, res: Response, next) => {
  try {
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      include: {
        patientProfile: true,
      },
    });

    res.json({
      success: true,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/therapists', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const therapists = await prisma.user.findMany({
      where: { role: 'THERAPIST' },
      include: {
        therapistProfile: true,
      },
    });

    res.json({
      success: true,
      data: therapists,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/therapists/:id/verify', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!['APPROVE', 'REJECT'].includes(action)) {
      throw createError('Invalid action', 400);
    }

    const therapistProfile = await prisma.therapistProfile.findFirst({
      where: { userId: id },
    });

    if (!therapistProfile) {
      throw createError('Therapist profile not found', 404);
    }

    await prisma.therapistProfile.update({
      where: { id: therapistProfile.id },
      data: {
        isVerified: action === 'APPROVE',
        verificationStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      },
    });

    res.json({
      success: true,
      message: `Therapist ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
