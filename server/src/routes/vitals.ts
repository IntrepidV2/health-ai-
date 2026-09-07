import fs from 'fs';
import path from 'path';
import { Router, Response } from 'express';
import multer from 'multer';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { analyzePatientRisk, extractDataFromDocument } from '../services/geminiService.js';
import {
  parsePpgCsv,
  estimateSamplingRate,
  smoothSignal,
  extractTimeFeatures,
  runPpgDetectors,
  synthesizePpgWithGemini,
} from '../services/ppgService.js';
import { PatientDTO, VitalRecordDTO, RiskAnalysisDTO } from '../types.js';

function getSamplePpgPath(): string {
  const p1 = path.resolve(process.cwd(), 'data/sample_ppg.csv');
  if (fs.existsSync(p1)) return p1;
  const p2 = path.resolve(process.cwd(), 'server/data/sample_ppg.csv');
  if (fs.existsSync(p2)) return p2;
  return p1;
}

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper to fetch full patient object for risk calculation
async function getFullPatientDTO(userId: string): Promise<PatientDTO | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vitals: { orderBy: { timestamp: 'asc' } },
      labResults: { orderBy: { timestamp: 'desc' } },
      riskAssessments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!user) return null;

  const latestRisk = user.riskAssessments[0];

  return {
    id: user.id,
    name: user.name,
    age: user.age,
    condition: user.condition,
    vitalsHistory: user.vitals.map((v) => ({
      id: v.id,
      timestamp: v.timestamp.toISOString(),
      source: v.source as any,
      systolic: v.systolic ?? undefined,
      diastolic: v.diastolic ?? undefined,
      heartRate: v.heartRate ?? undefined,
      temperature: v.temperature ?? undefined,
      oxygenSaturation: v.oxygenSaturation ?? undefined,
      glucose: v.glucose ?? undefined,
      notes: v.notes ?? undefined,
    })),
    labHistory: user.labResults.map((l) => ({
      id: l.id,
      timestamp: l.timestamp.toISOString(),
      testName: l.testName,
      value: l.value,
      unit: l.unit,
      range: l.range,
      flag: l.flag as any,
      source: 'HOSPITAL_UPLOAD',
    })),
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

// GET /api/vitals
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const patient = await getFullPatientDTO(userId);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    res.json(patient);
  } catch (err) {
    console.error('Get vitals error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/vitals
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { source, systolic, diastolic, heartRate, temperature, oxygenSaturation, glucose, notes } = req.body;

    const currentPatient = await getFullPatientDTO(userId);
    if (!currentPatient) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 1. Create VitalRecord in DB
    const record = await prisma.vitalRecord.create({
      data: {
        userId,
        source: source || 'MANUAL',
        systolic: systolic ? Number(systolic) : null,
        diastolic: diastolic ? Number(diastolic) : null,
        heartRate: heartRate ? Number(heartRate) : null,
        temperature: temperature ? Number(temperature) : null,
        oxygenSaturation: oxygenSaturation ? Number(oxygenSaturation) : null,
        glucose: glucose ? Number(glucose) : null,
        notes: notes || null,
      },
    });

    const newRecordDTO: VitalRecordDTO = {
      id: record.id,
      timestamp: record.timestamp.toISOString(),
      source: record.source as any,
      systolic: record.systolic ?? undefined,
      diastolic: record.diastolic ?? undefined,
      heartRate: record.heartRate ?? undefined,
      temperature: record.temperature ?? undefined,
      oxygenSaturation: record.oxygenSaturation ?? undefined,
      glucose: record.glucose ?? undefined,
      notes: record.notes ?? undefined,
    };

    // 2. Perform AI Risk Analysis on Server
    const analysis: RiskAnalysisDTO = await analyzePatientRisk(currentPatient, newRecordDTO);

    // 3. Save Risk Assessment to DB
    await prisma.riskAssessment.create({
      data: {
        userId,
        level: analysis.level,
        summary: analysis.summary,
        trend: analysis.trend,
        actionItems: JSON.stringify(analysis.actionItems),
        alertTriggered: analysis.alertTriggered,
      },
    });

    // 4. Return updated full patient object
    const updatedPatient = await getFullPatientDTO(userId);
    res.status(201).json(updatedPatient);
  } catch (err) {
    console.error('Post vital record error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/vitals/upload-document
router.post(
  '/upload-document',
  authenticateToken,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const currentPatient = await getFullPatientDTO(userId);
      if (!currentPatient) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // 1. Run Gemini OCR on file buffer
      const extracted = await extractDataFromDocument(file.buffer, file.mimetype, file.originalname);

      // 2. Create Vital Record
      const record = await prisma.vitalRecord.create({
        data: {
          userId,
          source: 'HOSPITAL_UPLOAD',
          systolic: extracted.systolic ?? null,
          diastolic: extracted.diastolic ?? null,
          heartRate: extracted.heartRate ?? null,
          temperature: extracted.temperature ?? null,
          glucose: extracted.glucose ?? null,
          notes: extracted.notes || `Extracted from ${file.originalname}`,
        },
      });

      const newRecordDTO: VitalRecordDTO = {
        id: record.id,
        timestamp: record.timestamp.toISOString(),
        source: 'HOSPITAL_UPLOAD',
        systolic: record.systolic ?? undefined,
        diastolic: record.diastolic ?? undefined,
        heartRate: record.heartRate ?? undefined,
        temperature: record.temperature ?? undefined,
        glucose: record.glucose ?? undefined,
        notes: record.notes ?? undefined,
      };

      // 3. AI Risk Analysis
      const analysis = await analyzePatientRisk(currentPatient, newRecordDTO);

      await prisma.riskAssessment.create({
        data: {
          userId,
          level: analysis.level,
          summary: analysis.summary,
          trend: analysis.trend,
          actionItems: JSON.stringify(analysis.actionItems),
          alertTriggered: analysis.alertTriggered,
        },
      });

      const updatedPatient = await getFullPatientDTO(userId);
      res.status(201).json(updatedPatient);
    } catch (err) {
      console.error('Document upload error:', err);
      res.status(500).json({ error: 'Failed to process medical document' });
    }
  }
);

// GET /api/vitals/sample-ppg
router.get('/sample-ppg', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const samplePath = getSamplePpgPath();
    if (!fs.existsSync(samplePath)) {
      res.status(404).json({ error: 'Sample dataset not found' });
      return;
    }
    const csvContent = fs.readFileSync(samplePath, 'utf-8');
    const parsed = parsePpgCsv(csvContent);
    const fsEst = estimateSamplingRate(parsed.times);

    // Return first 250 points for responsive client-side waveform preview
    const previewCount = Math.min(250, parsed.signals.length);
    const preview = [];
    for (let i = 0; i < previewCount; i++) {
      preview.push({
        time: parseFloat(parsed.times[i].toFixed(2)),
        signal: parseFloat(parsed.signals[i].toFixed(4)),
      });
    }

    res.json({
      filename: 'sujeto4_PPG_INFO.csv',
      pointsCount: parsed.signals.length,
      durationSec: parseFloat((parsed.times[parsed.times.length - 1] - parsed.times[0]).toFixed(1)),
      samplingRate: fsEst,
      metadata: {
        age: parsed.age || 38,
        sex: parsed.sex || 'M',
        cholesterol: parsed.cholesterol || 205,
      },
      preview,
    });
  } catch (err) {
    console.error('Failed to load sample PPG:', err);
    res.status(500).json({ error: 'Failed to load sample PPG dataset' });
  }
});

// POST /api/vitals/analyze-ppg
router.post(
  '/analyze-ppg',
  authenticateToken,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      let csvContent = '';

      if (req.file) {
        csvContent = req.file.buffer.toString('utf-8');
      } else if (req.body.csvText) {
        csvContent = req.body.csvText;
      } else if (req.body.useSample) {
        const samplePath = getSamplePpgPath();
        if (fs.existsSync(samplePath)) {
          csvContent = fs.readFileSync(samplePath, 'utf-8');
        } else {
          res.status(404).json({ error: 'Sample dataset file not found on server' });
          return;
        }
      } else {
        res.status(400).json({ error: 'Please upload a CSV file or specify useSample: true' });
        return;
      }

      // 1. Parse CSV
      const { times, signals, age, sex, cholesterol } = parsePpgCsv(csvContent);
      const fsEst = estimateSamplingRate(times);

      // 2. Preprocess & Extract Features
      const smoothed = smoothSignal(signals, 3);
      const { features, peakIndices } = extractTimeFeatures(smoothed, fsEst);
      const detectors = runPpgDetectors(features, cholesterol);

      // 3. Fetch patient for AI clinical synthesis
      const currentPatient = await getFullPatientDTO(userId);
      const metadata = { age, sex, cholesterol };
      const aiResult = await synthesizePpgWithGemini(features, detectors, currentPatient || undefined, metadata);

      // 4. Build sample waveform points (first 250 points) with peaks marked for UI
      const peakSet = new Set(peakIndices);
      const waveformLimit = Math.min(250, signals.length);
      const sampleWaveform = [];
      for (let i = 0; i < waveformLimit; i++) {
        sampleWaveform.push({
          time: parseFloat(times[i].toFixed(2)),
          value: parseFloat(signals[i].toFixed(4)),
          isPeak: peakSet.has(i),
        });
      }

      // 5. Persist vital record into SQLite database as source 'WEARABLE'
      const record = await prisma.vitalRecord.create({
        data: {
          userId,
          source: 'WEARABLE',
          heartRate: Math.round(features.hr_mean),
          notes: `PPG Wearable Recording: ${detectors.stress.level} Stress (${detectors.stress.percentage}%), ${detectors.arrhythmia.detected ? 'Arrhythmia Risk' : 'Normal Rhythm'} (SDNN: ${(features.sdnn * 1000).toFixed(0)}ms)`,
        },
      });

      const newRecordDTO: VitalRecordDTO = {
        id: record.id,
        timestamp: record.timestamp.toISOString(),
        source: 'WEARABLE',
        heartRate: record.heartRate ?? undefined,
        notes: record.notes ?? undefined,
      };

      // 6. Update overall patient risk assessment with Gemini
      if (currentPatient) {
        const overallRisk = await analyzePatientRisk(currentPatient, newRecordDTO);
        await prisma.riskAssessment.create({
          data: {
            userId,
            level: overallRisk.level,
            summary: overallRisk.summary,
            trend: overallRisk.trend,
            actionItems: JSON.stringify(overallRisk.actionItems),
            alertTriggered: overallRisk.alertTriggered,
          },
        });
      }

      const updatedPatient = await getFullPatientDTO(userId);

      const durationSec = times.length > 1 ? parseFloat((times[times.length - 1] - times[0]).toFixed(1)) : 0;

      res.status(201).json({
        features,
        detectors,
        aiSummary: aiResult.summary,
        recommendations: aiResult.recommendations,
        metadata: {
          age,
          sex,
          cholesterol,
          durationSec,
        },
        sampleWaveform,
        updatedPatient,
      });
    } catch (err: any) {
      console.error('PPG Analysis error:', err);
      res.status(500).json({ error: err.message || 'Failed to process PPG biosignal recording' });
    }
  }
);

export default router;
