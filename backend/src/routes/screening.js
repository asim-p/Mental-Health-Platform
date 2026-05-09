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
        confidence: result.confidence,
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

router.get('/recommendations', async (req, res, next) => {
  try {
    const { category, budget, gender, language } = req.query;

    const matchCategory = category === 'Normal' ? 'General Consultation' : category;

    const pipeline = [
      // 1. Initial filter: Only verified therapists
      { $match: { isVerified: true } },

      // 2. Calculate score based on matches
      {
        $addFields: {
          relevanceScore: {
            $add: [
              // Specialization match (Clinical match is highest priority)
              { $cond: [{ $in: [matchCategory, "$specialization"] }, 10, 0] },
              
              // Gender match
              { $cond: [{ $eq: ["$gender", gender] }, 5, 0] },
              
              // Language match
              { 
                $cond: [
                  { 
                    $gt: [
                      { $size: { $ifNull: [{ $setIntersection: ["$languages", [language]] }, []] } }, 
                      0 
                    ] 
                  }, 
                  5, 
                  0 
                ] 
              },
              
              // Budget match (if budget is provided)
              { 
                $cond: [
                  { 
                    $and: [
                      { $ne: [budget, undefined] },
                      { $lte: ["$hourlyRate", parseFloat(budget) || 999999] }
                    ] 
                  }, 
                  5, 
                  0 
                ] 
              }
            ]
          }
        }
      },

      // 3. Sort by score (highest first) and then by rating
      { $sort: { relevanceScore: -1, rating: -1 } },

      // 4. Limit to top recommendations
      { $limit: 10 },

      // 5. Populate user data
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' }
    ];

    const therapists = await TherapistProfile.aggregate(pipeline);

    const mappedTherapists = therapists.map((t) => ({
      id: t._id.toString(),
      specialization: t.specialization,
      hourlyRate: t.hourlyRate,
      gender: t.gender,
      rating: t.rating,
      languages: t.languages,
      relevanceScore: t.relevanceScore,
      user: {
        id: t.userDetails._id.toString(),
        firstName: t.userDetails.firstName,
        lastName: t.userDetails.lastName,
        email: t.userDetails.email
      }
    }));

    res.json({
      success: true,
      data: mappedTherapists,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
