import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import TherapistProfile from '../models/TherapistProfile.js';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['PATIENT', 'THERAPIST']).default('PATIENT'),
  therapistData: z.object({
    specialization: z.array(z.string()).optional(),
    qualifications: z.array(z.string()).optional(),
    yearsOfExperience: z.number().optional(),
    bio: z.string().optional(),
    hourlyRate: z.number().optional(),
    gender: z.string().optional(),
    languages: z.array(z.string()).optional(),
    credentials: z.string().optional(),
    licenseNumber: z.string().optional(),
  }).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw createError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = new User({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
    });
    await user.save();

    let profile = null;

    if (data.role === 'PATIENT') {
      profile = new PatientProfile({ user: user._id });
      await profile.save();
    } else if (data.role === 'THERAPIST') {
      profile = new TherapistProfile({
        user: user._id,
        specialization: data.therapistData?.specialization || [],
        qualifications: data.therapistData?.qualifications || [],
        yearsOfExperience: data.therapistData?.yearsOfExperience || 0,
        bio: data.therapistData?.bio,
        hourlyRate: data.therapistData?.hourlyRate || 1500,
        gender: data.therapistData?.gender,
        languages: data.therapistData?.languages || ['Nepali'],
        credentials: data.therapistData?.credentials,
        licenseNumber: data.therapistData?.licenseNumber,
      });
      await profile.save();
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password as string);

    if (!isValidPassword) {
      throw createError('Invalid credentials', 401);
    }

    let profile = null;
    if (user.role === 'PATIENT') {
        profile = await PatientProfile.findOne({ user: user._id }).lean();
    } else {
        profile = await TherapistProfile.findOne({ user: user._id }).lean();
    }

    if (profile) {
        (profile as any).id = profile._id.toString();
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profile,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token required', 400);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
    };

    const user = await User.findById(decoded.id);

    if (!user) {
      throw createError('User not found', 401);
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      throw createError('User not found', 404);
    }

    let profile = null;
    if (user.role === 'PATIENT') {
        profile = await PatientProfile.findOne({ user: user._id }).lean();
    } else {
        profile = await TherapistProfile.findOne({ user: user._id }).lean();
    }

    if(profile) {
        (profile as any).id = profile._id.toString();
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
          profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
