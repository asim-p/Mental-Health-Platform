import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      specialty,
      language,
      minPrice,
      maxPrice,
      gender,
      minRating,
      verified,
      search,
      page = '1',
      limit = '10',
    } = req.query;

    const where: any = {
      isVerified: verified === 'true' ? true : undefined,
    };

    if (specialty) {
      where.specialization = { hasSome: [specialty as string] };
    }

    if (language) {
      where.languages = { hasSome: [language as string] };
    }

    if (gender) {
      where.gender = gender;
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating as string) };
    }

    if (minPrice || maxPrice) {
      where.hourlyRate = {};
      if (minPrice) where.hourlyRate.gte = parseFloat(minPrice as string);
      if (maxPrice) where.hourlyRate.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      where.OR = [
        { bio: { contains: search as string, mode: 'insensitive' } },
        { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [therapists, total] = await Promise.all([
      prisma.therapistProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          availability: true,
        },
        skip,
        take: limitNum,
        orderBy: { rating: 'desc' },
      }),
      prisma.therapistProfile.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        therapists,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, Response, next) => {
  try {
    const { id } = req.params;

    const profile = await prisma.therapistProfile.findFirst({
      where: { userId: id },
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
        availability: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!profile) {
      throw createError('Therapist not found', 404);
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/availability', async (req, res, Response, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const profile = await prisma.therapistProfile.findFirst({
      where: { userId: id },
      include: { availability: true },
    });

    if (!profile) {
      throw createError('Therapist not found', 404);
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        therapistId: profile.id,
        scheduledAt: {
          gte: new Date(date as string || new Date()),
        },
        status: { not: 'CANCELLED' },
      },
      select: {
        scheduledAt: true,
      },
    });

    const bookedSlots = appointments.map((a) => a.scheduledAt.toISOString());

    res.json({
      success: true,
      data: {
        availability: profile.availability,
        bookedSlots,
      },
    });
  } catch (error) {
    next(error);
  }
});

const updateAvailabilitySchema = z.object({
  availability: z.array(
    z.object({
      id: z.string().optional(),
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      isAvailable: z.boolean(),
    })
  ),
});

router.patch('/availability', authenticate, authorize('THERAPIST'), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateAvailabilitySchema.parse(req.body);

    const profile = await prisma.therapistProfile.findFirst({
      where: { userId: req.user!.id },
    });

    if (!profile) {
      throw createError('Therapist profile not found', 404);
    }

    await prisma.availability.deleteMany({
      where: { therapistId: profile.id },
    });

    await prisma.availability.createMany({
      data: data.availability.map((slot) => ({
        therapistId: profile.id,
        ...slot,
      })),
    });

    const updated = await prisma.availability.findMany({
      where: { therapistId: profile.id },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

const updateProfileSchema = z.object({
  specialization: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  yearsOfExperience: z.number().optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().optional(),
  gender: z.string().optional(),
  languages: z.array(z.string()).optional(),
  zoomUserId: z.string().optional(),
});

router.patch('/profile', authenticate, authorize('THERAPIST'), async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const profile = await prisma.therapistProfile.findFirst({
      where: { userId: req.user!.id },
    });

    if (!profile) {
      throw createError('Therapist profile not found', 404);
    }

    const updated = await prisma.therapistProfile.update({
      where: { id: profile.id },
      data,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
