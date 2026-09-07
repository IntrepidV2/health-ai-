import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/appointments
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    res.json(appointments);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/appointments
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { doctor, specialty, date, type, status, location } = req.body;

    if (!doctor || !specialty || !date) {
      res.status(400).json({ error: 'Doctor, specialty, and date are required' });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        doctor,
        specialty,
        date,
        type: type || 'General Consultation',
        status: status || 'Upcoming',
        location: location || 'Main Clinic',
      },
    });

    const all = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    res.status(201).json(all);
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    await prisma.appointment.deleteMany({
      where: { id, userId },
    });

    const all = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    res.json(all);
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
