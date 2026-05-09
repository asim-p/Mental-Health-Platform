import { Router } from 'express';
import User, { UserRole } from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import TherapistProfile from '../models/TherapistProfile.js';
import Availability from '../models/Availability.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw createError('User not found', 404);
    }

    let profile = null;
    if (user.role === UserRole.PATIENT) {
      profile = await PatientProfile.findOne({ user: user._id }).lean();
    } else if (user.role === UserRole.THERAPIST) {
      profile = await TherapistProfile.findOne({ user: user._id }).lean();
      if (profile) {
        profile.availability = await Availability.find({ therapistId: profile._id }).lean();
      }
    }

    if (profile) {
        profile.id = profile._id.toString();
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
          profile: profile,
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

router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(req.user.id, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    }, { new: true });

    if (user && user.role === UserRole.PATIENT && data.profileData) {
      await PatientProfile.findOneAndUpdate(
        { user: user._id },
        {
          dateOfBirth: data.profileData.dateOfBirth ? new Date(data.profileData.dateOfBirth) : undefined,
          gender: data.profileData.gender,
          address: data.profileData.address,
          emergencyContact: data.profileData.emergencyContact,
          preferredLanguage: data.profileData.preferredLanguage,
        }
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/patients', authenticate, authorize('ADMIN', 'THERAPIST'), async (req, res, next) => {
  try {
    const patients = await User.find({ role: UserRole.PATIENT }).lean();
    const profiles = await PatientProfile.find({ user: { $in: patients.map(p => p._id) } }).lean();

    const data = patients.map(p => ({
      ...p,
      id: p._id.toString(),
      patientProfile: profiles.find(profile => profile.user.toString() === p._id.toString())
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/therapists', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const therapists = await User.find({ role: UserRole.THERAPIST }).lean();
    const profiles = await TherapistProfile.find({ user: { $in: therapists.map(t => t._id) } }).lean();

    const data = therapists.map(t => ({
      ...t,
      id: t._id.toString(),
      therapistProfile: profiles.find(profile => profile.user.toString() === t._id.toString())
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/therapists/:id/verify', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!['APPROVE', 'REJECT'].includes(action)) {
      throw createError('Invalid action', 400);
    }

    const therapistProfile = await TherapistProfile.findOne({ user: id });

    if (!therapistProfile) {
      throw createError('Therapist profile not found', 404);
    }

    therapistProfile.isVerified = action === 'APPROVE';
    therapistProfile.verificationStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await therapistProfile.save();

    res.json({
      success: true,
      message: `Therapist ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);
    await PatientProfile.findOneAndDelete({ user: id });
    await TherapistProfile.findOneAndDelete({ user: id });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
