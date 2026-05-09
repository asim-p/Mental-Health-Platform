import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const router = Router();

router.post('/predict', authenticate, async (req: AuthRequest, res: Response, next) => {
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

    const result = await aiResponse.json() as {
      category: string;
      confidence: number;
      recommendedSpecializations: string[];
    };

    const patientProfile = await prisma.patientProfile.findFirst({
      where: { userId: req.user!.id },
    });

    if (patientProfile) {
      await prisma.patientProfile.update({
        where: { id: patientProfile.id },
        data: { lastScreeningAt: new Date() },
      });

      await prisma.screeningResult.create({
        data: {
          patientId: patientProfile.id,
          inputText: text,
          predictedCategory: result.category,
          confidence: result.confidence,
          recommendedSpecializations: result.recommendedSpecializations,
        },
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const patientProfile = await prisma.patientProfile.findFirst({
      where: { userId: req.user!.id },
    });

    if (!patientProfile) {
      throw createError('Patient profile not found', 404);
    }

    const results = await prisma.screeningResult.findMany({
      where: { patientId: patientProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/recommendations', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { category, budget, gender, language } = req.query;

    const where: any = {
      isVerified: true,
    };

    if (category) {
      where.specialization = { hasSome: [category as string] };
    }

    if (gender) {
      where.gender = gender;
    }

    if (language) {
      where.languages = { hasSome: [language as string] };
    }

    if (budget) {
      where.hourlyRate = { lte: parseFloat(budget as string) };
    }

    const therapists = await prisma.therapistProfile.findMany({
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
      orderBy: { rating: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: therapists,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
