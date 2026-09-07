import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { chatWithAssistant } from '../services/geminiService.js';
import { PatientDTO } from '../types.js';

const router = Router();

// POST /api/ai/chat
router.post('/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { history, message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Fetch user with latest vitals and risk for medical grounding context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vitals: { orderBy: { timestamp: 'desc' }, take: 5 },
        riskAssessments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    let patientContext: PatientDTO | undefined = undefined;

    if (user) {
      const latestRisk = user.riskAssessments[0];
      patientContext = {
        id: user.id,
        name: user.name,
        age: user.age,
        condition: user.condition,
        vitalsHistory: user.vitals.reverse().map((v) => ({
          id: v.id,
          timestamp: v.timestamp.toISOString(),
          source: v.source as any,
          systolic: v.systolic ?? undefined,
          diastolic: v.diastolic ?? undefined,
          heartRate: v.heartRate ?? undefined,
          temperature: v.temperature ?? undefined,
          glucose: v.glucose ?? undefined,
          notes: v.notes ?? undefined,
        })),
        labHistory: [],
        currentRisk: latestRisk
          ? {
              level: latestRisk.level as any,
              summary: latestRisk.summary,
              trend: latestRisk.trend as any,
              actionItems: JSON.parse(latestRisk.actionItems),
              alertTriggered: latestRisk.alertTriggered,
            }
          : {
              level: 'NORMAL',
              summary: 'All vital signs are stable.',
              trend: 'STABLE',
              actionItems: ['Continue daily logging'],
              alertTriggered: false,
            },
      };
    }

    const response = await chatWithAssistant(history || [], message, patientContext);
    res.json(response);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      text: 'Sorry, I encountered an error. Please try again.',
      groundingChunks: [],
    });
  }
});

export default router;
