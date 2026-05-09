import { Router } from 'express';
import PatientProfile from '../models/PatientProfile.js';
import ScreeningResult from '../models/ScreeningResult.js';
import TherapistProfile from '../models/TherapistProfile.js';
import Availability from '../models/Availability.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import fetch from 'node-fetch';

const router = Router();

router.post('/predict', authenticate, async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      throw createError('Text must be at least 10 characters', 400);
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';

    const aiResponse = await fetch(`${aiServiceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!aiResponse.ok) {
      throw createError('AI service unavailable', 503);
    }

    const result = await aiResponse.json();
    
    const patientProfile = await PatientProfile.findOne({ user: req.user.id });
    
    if (patientProfile) {
      patientProfile.lastScreeningAt = new Date();
      await patientProfile.save();
    
      const screeningResult = new ScreeningResult({
        patientId: patientProfile._id,
        inputText: text,
        predictedCategory: result.category,
      });
      await screeningResult.save();
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history', authenticate, async (req, res, next) => {
  try {
    const patientProfile = await PatientProfile.findOne({ user: req.user.id });

    if (!patientProfile) {
      throw createError('Patient profile not found', 404);
    }

    const results = await ScreeningResult.find({ patientId: patientProfile._id })
      .sort({ createdAt: -1 })
      .lean();

    const mappedResults = results.map((r) => {
        r.id = r._id.toString();
        return r;
    });

    res.json({
      success: true,
      data: mappedResults,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/recommendations', authenticate, async (req, res, next) => {
  try {
    const { category, budget, gender, language } = req.query;

    const where = {
      isVerified: true,
    };

    if (category) {
      where.specialization = { $in: [category] };
    }

    if (gender) {
      where.gender = gender;
    }

    if (language) {
      where.languages = { $in: [language] };
    }

    if (budget) {
      where.hourlyRate = { $lte: parseFloat(budget) };
    }

    const therapists = await TherapistProfile.find(where)
      .populate('user', 'firstName lastName email')
      .sort({ rating: -1 })
      .limit(10)
      .lean();

    const populatedTherapists = await Promise.all(therapists.map(async (t) => {
      t.id = t._id.toString();
      t.user.id = t.user._id.toString();
      t.availability = await Availability.find({ therapistId: t._id }).lean();
      return t;
    }));

    res.json({
      success: true,
      data: populatedTherapists,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
