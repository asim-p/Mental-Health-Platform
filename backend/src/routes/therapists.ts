import { Router, Response } from 'express';
import User from '../models/User.js';
import TherapistProfile from '../models/TherapistProfile.js';
import Availability from '../models/Availability.js';
import Appointment, { AppointmentStatus } from '../models/Appointment.js';
import Review from '../models/Review.js';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';

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

    const where: any = {};
    if (verified === 'true') where.isVerified = true;

    if (specialty) where.specialization = { $in: [specialty as string] };
    if (language) where.languages = { $in: [language as string] };
    if (gender) where.gender = gender;
    if (minRating) where.rating = { $gte: parseFloat(minRating as string) };

    if (minPrice || maxPrice) {
      where.hourlyRate = {};
      if (minPrice) where.hourlyRate.$gte = parseFloat(minPrice as string);
      if (maxPrice) where.hourlyRate.$lte = parseFloat(maxPrice as string);
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      const matchingUsers = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      where.$or = [
        { bio: searchRegex },
        { user: { $in: userIds } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const total = await TherapistProfile.countDocuments(where);
    const therapists = await TherapistProfile.find(where)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'firstName lastName email')
      .lean();

    const populatedTherapists = await Promise.all(therapists.map(async (t: any) => {
      t.id = t._id.toString();
      t.user.id = t.user._id.toString();
      t.availability = await Availability.find({ therapistId: t._id }).lean();
      return t;
    }));

    res.json({
      success: true,
      data: {
        therapists: populatedTherapists,
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

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile: any = await TherapistProfile.findOne({ user: id })
      .populate('user', 'firstName lastName email phone')
      .lean();

    if (!profile) {
      throw createError('Therapist not found', 404);
    }

    profile.id = profile._id.toString();
    if(profile.user) profile.user.id = profile.user._id.toString();

    profile.availability = await Availability.find({ therapistId: profile._id }).lean();
    profile.reviews = await Review.find({ therapistId: profile._id }).sort({ createdAt: -1 }).limit(10).lean();

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/availability', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const profile: any = await TherapistProfile.findOne({ user: id }).lean();

    if (!profile) {
      throw createError('Therapist not found', 404);
    }
    
    profile.availability = await Availability.find({ therapistId: profile._id }).lean();

    const appointments = await Appointment.find({
      therapistId: profile._id,
      scheduledAt: {
        $gte: new Date(date as string || new Date()),
      },
      status: { $ne: AppointmentStatus.CANCELLED },
    }).select('scheduledAt').lean();

    const bookedSlots = appointments.map((a: any) => a.scheduledAt.toISOString());

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

    const profile = await TherapistProfile.findOne({ user: req.user!.id });

    if (!profile) {
      throw createError('Therapist profile not found', 404);
    }

    await Availability.deleteMany({ therapistId: profile._id });

    const newAvailability = data.availability.map((slot) => ({
      therapistId: profile._id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable
    }));

    await Availability.insertMany(newAvailability);

    const updated = await Availability.find({ therapistId: profile._id }).lean();

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

    const profile = await TherapistProfile.findOneAndUpdate(
      { user: req.user!.id },
      data,
      { new: true }
    ).lean();

    if (!profile) {
      throw createError('Therapist profile not found', 404);
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
