import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pulsera_jwt_secret_dev_key_123';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        riskAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const latestRisk = user.riskAssessments[0];

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        condition: user.condition,
        role: user.role,
        currentRisk: latestRisk
          ? {
              level: latestRisk.level,
              summary: latestRisk.summary,
              trend: latestRisk.trend,
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
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, age, condition } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name,
        age: age ? Number(age) : 30,
        condition: condition || 'General Health',
        role: 'PATIENT',
        riskAssessments: {
          create: {
            level: 'NORMAL',
            summary: 'Welcome to Pulsera! Log your first vitals to begin analysis.',
            trend: 'STABLE',
            actionItems: JSON.stringify(['Log daily blood pressure', 'Log resting heart rate']),
            alertTriggered: false,
          },
        },
      },
      include: {
        riskAssessments: true,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const latestRisk = user.riskAssessments[0];

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        condition: user.condition,
        role: user.role,
        currentRisk: {
          level: latestRisk.level,
          summary: latestRisk.summary,
          trend: latestRisk.trend,
          actionItems: JSON.parse(latestRisk.actionItems),
          alertTriggered: latestRisk.alertTriggered,
        },
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        riskAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const latestRisk = user.riskAssessments[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        condition: user.condition,
        role: user.role,
        currentRisk: latestRisk
          ? {
              level: latestRisk.level,
              summary: latestRisk.summary,
              trend: latestRisk.trend,
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
      },
    });
  } catch (err) {
    console.error('Auth /me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
