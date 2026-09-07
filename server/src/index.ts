import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

import authRouter from './routes/auth.js';
import vitalsRouter from './routes/vitals.js';
import appointmentsRouter from './routes/appointments.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: '*', // Allows requests from Vite dev server, Capacitor app, and mobile devices
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/vitals', vitalsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/ai', aiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed demo account on startup if database is empty
async function seedDemoData() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'alex@example.com' },
    });

    if (!existing) {
      console.log('Seeding demo patient account (alex@example.com)...');
      const passwordHash = await bcrypt.hash('password123', 10);

      const user = await prisma.user.create({
        data: {
          email: 'alex@example.com',
          passwordHash,
          name: 'Alex Rivera',
          age: 42,
          condition: 'Hypertension & Pre-diabetes',
          role: 'PATIENT',
          riskAssessments: {
            create: {
              level: 'NORMAL',
              summary: 'Your vitals are slightly elevating but remain within a manageable range.',
              trend: 'STABLE',
              actionItems: JSON.stringify([
                'Monitor glucose before breakfast',
                'Reduce sodium intake',
                'Take evening walk',
              ]),
              alertTriggered: false,
            },
          },
          appointments: {
            createMany: {
              data: [
                {
                  doctor: 'Dr. Emily Chen',
                  specialty: 'Endocrinologist',
                  date: 'Mon 10:00',
                  type: 'Specialist Checkup',
                  status: 'Upcoming',
                  location: 'Metro Health Pavilion',
                },
                {
                  doctor: 'Dr. Sarah Jenkins',
                  specialty: 'Cardiology',
                  date: 'Oct 24, 2:30 PM',
                  type: 'Routine Follow-up',
                  status: 'Upcoming',
                  location: 'Heart & Vascular Center',
                },
              ],
            },
          },
          vitals: {
            createMany: {
              data: [
                {
                  timestamp: new Date(Date.now() - 3 * 86400000),
                  source: 'MANUAL',
                  systolic: 120,
                  diastolic: 80,
                  heartRate: 72,
                  temperature: 98.4,
                  glucose: 95,
                  notes: 'Baseline reading',
                },
                {
                  timestamp: new Date(Date.now() - 2 * 86400000),
                  source: 'WEARABLE',
                  systolic: 122,
                  diastolic: 82,
                  heartRate: 75,
                  temperature: 98.6,
                  glucose: 98,
                  notes: 'Post workout reading',
                },
                {
                  timestamp: new Date(Date.now() - 86400000),
                  source: 'MANUAL',
                  systolic: 125,
                  diastolic: 84,
                  heartRate: 78,
                  temperature: 98.8,
                  glucose: 102,
                  notes: 'Evening reading',
                },
              ],
            },
          },
        },
      });

      console.log('Demo user seeded successfully:', user.email);
    }
  } catch (err) {
    console.error('Failed to seed demo data:', err);
  }
}

app.listen(PORT, async () => {
  console.log(`Pulsera Backend Server is running on http://localhost:${PORT}`);
  await seedDemoData();
});
