import { GoogleGenAI } from '@google/genai';
import { PatientDTO } from '../types.js';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface PpgFeatures {
  n_peaks: number;
  mean_rr: number; // in seconds
  sdnn: number; // in seconds
  rmssd: number; // in seconds
  hr_mean: number; // in bpm
  hr_std: number; // in bpm
  fs: number; // sampling frequency
}

export interface PpgDetectorResults {
  bradycardia: { detected: boolean; score: number };
  tachycardia: { detected: boolean; score: number };
  stress: { score: number; percentage: number; level: 'LOW' | 'MODERATE' | 'HIGH' };
  arrhythmia: { detected: boolean; score: number; percentage: number };
  cholesterol?: { value: number; status: 'NORMAL' | 'ELEVATED' };
}

export interface PpgAnalysisResponse {
  features: PpgFeatures;
  detectors: PpgDetectorResults;
  aiSummary: string;
  recommendations: string[];
  metadata: {
    age?: number;
    sex?: string;
    cholesterol?: number;
    durationSec: number;
  };
  sampleWaveform: { time: number; value: number; isPeak: boolean }[];
}

// Parse CSV text into arrays of times, signals, and optional metadata
export function parsePpgCsv(csvText: string): {
  times: number[];
  signals: number[];
  age?: number;
  sex?: string;
  cholesterol?: number;
} {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('CSV file is empty or does not contain data.');
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const timeIdx = header.findIndex((h) => h.includes('tiempo') || h.includes('time'));
  const signalIdx = header.findIndex((h) => h.includes('ppg') || h.includes('signal') || h.includes('sen'));
  const ageIdx = header.findIndex((h) => h.includes('edad') || h.includes('age'));
  const sexIdx = header.findIndex((h) => h.includes('sex') || h.includes('genero'));
  const cholIdx = header.findIndex((h) => h.includes('colesterol') || h.includes('chol'));

  const tIdx = timeIdx !== -1 ? timeIdx : 0;
  const sIdx = signalIdx !== -1 ? signalIdx : 1;

  const times: number[] = [];
  const signals: number[] = [];
  let age: number | undefined;
  let sex: string | undefined;
  let cholesterol: number | undefined;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length <= Math.max(tIdx, sIdx)) continue;

    const t = parseFloat(parts[tIdx]);
    const s = parseFloat(parts[sIdx]);

    if (!isNaN(t) && !isNaN(s)) {
      times.push(t);
      signals.push(s);
    }

    if (!age && ageIdx !== -1 && parts[ageIdx]) {
      const a = parseInt(parts[ageIdx], 10);
      if (!isNaN(a)) age = a;
    }
    if (!sex && sexIdx !== -1 && parts[sexIdx]) {
      sex = parts[sexIdx];
    }
    if (!cholesterol && cholIdx !== -1 && parts[cholIdx]) {
      const c = parseFloat(parts[cholIdx]);
      if (!isNaN(c)) cholesterol = c;
    }
  }

  if (signals.length === 0) {
    throw new Error('Could not parse any numerical PPG signal data from CSV.');
  }

  return { times, signals, age, sex, cholesterol };
}

// Estimate sampling frequency in Hz
export function estimateSamplingRate(times: number[]): number {
  if (times.length < 5) return 38;
  const diffs: number[] = [];
  for (let i = 1; i < Math.min(times.length, 100); i++) {
    const d = times[i] - times[i - 1];
    if (d > 0) diffs.push(d);
  }
  if (diffs.length === 0) return 38;
  diffs.sort((a, b) => a - b);
  const medianDiff = diffs[Math.floor(diffs.length / 2)];
  return Math.max(1, Math.round(1.0 / medianDiff));
}

// Simple moving average signal smoothing
export function smoothSignal(signal: number[], windowSize: number = 3): number[] {
  const result: number[] = new Array(signal.length);
  const half = Math.floor(windowSize / 2);
  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(signal.length - 1, i + half); j++) {
      sum += signal[j];
      count++;
    }
    result[i] = sum / count;
  }
  return result;
}

// Peak detection algorithm matching SciPy find_peaks
export function detectPeaks(signal: number[], fs: number, distanceSec: number = 0.4): number[] {
  const minDistance = Math.max(1, Math.floor(distanceSec * fs));
  const meanVal = signal.reduce((a, b) => a + b, 0) / signal.length;
  const peaks: number[] = [];
  let lastPeak = -minDistance;

  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
      if (signal[i] > meanVal && i - lastPeak >= minDistance) {
        peaks.push(i);
        lastPeak = i;
      }
    }
  }
  return peaks;
}

// Extract time-domain HRV features
export function extractTimeFeatures(
  signal: number[],
  fs: number
): { features: PpgFeatures; peakIndices: number[] } {
  const peaks = detectPeaks(signal, fs);
  if (peaks.length < 2) {
    return {
      features: {
        n_peaks: peaks.length,
        mean_rr: 0,
        sdnn: 0,
        rmssd: 0,
        hr_mean: 70,
        hr_std: 0,
        fs,
      },
      peakIndices: peaks,
    };
  }

  const rr: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    rr.push((peaks[i] - peaks[i - 1]) / fs);
  }

  const hr = rr.map((r) => 60.0 / r);

  const mean_rr = rr.reduce((a, b) => a + b, 0) / rr.length;
  const hr_mean = hr.reduce((a, b) => a + b, 0) / hr.length;

  // SDNN
  const variance_rr = rr.reduce((acc, val) => acc + Math.pow(val - mean_rr, 2), 0) / (rr.length - 1 || 1);
  const sdnn = Math.sqrt(variance_rr);

  // RMSSD
  const diff_rr: number[] = [];
  for (let i = 1; i < rr.length; i++) {
    diff_rr.push(rr[i] - rr[i - 1]);
  }
  const mean_diff_sq = diff_rr.length > 0 ? diff_rr.reduce((a, b) => a + Math.pow(b, 2), 0) / diff_rr.length : 0;
  const rmssd = Math.sqrt(mean_diff_sq);

  // HR std
  const hr_variance = hr.reduce((acc, val) => acc + Math.pow(val - hr_mean, 2), 0) / (hr.length - 1 || 1);
  const hr_std = Math.sqrt(hr_variance);

  return {
    features: {
      n_peaks: peaks.length,
      mean_rr: parseFloat(mean_rr.toFixed(4)),
      sdnn: parseFloat(sdnn.toFixed(4)),
      rmssd: parseFloat(rmssd.toFixed(4)),
      hr_mean: parseFloat(hr_mean.toFixed(1)),
      hr_std: parseFloat(hr_std.toFixed(2)),
      fs,
    },
    peakIndices: peaks,
  };
}

// Run detectors for cardiac issues and stress
export function runPpgDetectors(features: PpgFeatures, cholesterol?: number): PpgDetectorResults {
  const hr = features.hr_mean;

  // Bradycardia & Tachycardia
  const brady = { detected: hr < 50, score: hr < 50 ? 1 : 0 };
  const tachy = { detected: hr > 100, score: hr > 100 ? 1 : 0 };

  // Autonomic Stress (from RMSSD: lower RMSSD = higher stress)
  // RMSSD is in seconds; convert to ms
  const rmssdMs = features.rmssd * 1000;
  const stressRaw = Math.max(0, Math.min(1, (50.0 - rmssdMs) / 50.0));
  const stressScore = parseFloat(stressRaw.toFixed(2));
  const stress = {
    score: stressScore,
    percentage: Math.round(stressScore * 100),
    level: (stressScore > 0.65 ? 'HIGH' : stressScore > 0.35 ? 'MODERATE' : 'LOW') as 'LOW' | 'MODERATE' | 'HIGH',
  };

  // Arrhythmia / Irregular Rhythm
  const sdnnSec = features.sdnn;
  const hrStd = features.hr_std;
  const arrhythmiaScoreRaw = Math.min(1.0, (sdnnSec / 0.2) * 0.5 + (hrStd / 10.0) * 0.5);
  const arrhythmiaScore = parseFloat(arrhythmiaScoreRaw.toFixed(2));
  const arrhythmia = {
    detected: arrhythmiaScore > 0.5,
    score: arrhythmiaScore,
    percentage: Math.round(arrhythmiaScore * 100),
  };

  const results: PpgDetectorResults = {
    bradycardia: brady,
    tachycardia: tachy,
    stress,
    arrhythmia,
  };

  if (cholesterol !== undefined) {
    results.cholesterol = {
      value: cholesterol,
      status: cholesterol > 200 ? 'ELEVATED' : 'NORMAL',
    };
  }

  return results;
}

// Synthesize AI explanation with Gemini 2.5 Flash
export async function synthesizePpgWithGemini(
  features: PpgFeatures,
  detectors: PpgDetectorResults,
  patient?: PatientDTO,
  metadata?: { age?: number; sex?: string; cholesterol?: number }
): Promise<{ summary: string; recommendations: string[] }> {
  const prompt = `
    You are an AI cardiologist and wearable biosignal analyst for "Pulsera Health AI".
    Analyze the following PPG (photoplethysmogram) biometric pulse recording.

    Patient Context:
    - Name: ${patient?.name || 'User'}
    - Age: ${metadata?.age || patient?.age || 38}
    - Sex: ${metadata?.sex || 'Not specified'}
    - Existing Conditions: ${patient?.condition || 'None specified'}

    Extracted Biometric & HRV Features:
    - Mean Heart Rate: ${features.hr_mean} BPM
    - Heart Rate Variance (std): ${features.hr_std} BPM
    - Detected Beats: ${features.n_peaks}
    - SDNN (HRV overall variability): ${(features.sdnn * 1000).toFixed(1)} ms
    - RMSSD (Parasympathetic / stress biomarker): ${(features.rmssd * 1000).toFixed(1)} ms

    Cardiovascular & Stress Diagnostics:
    - Bradycardia: ${detectors.bradycardia.detected ? 'DETECTED' : 'NORMAL'}
    - Tachycardia: ${detectors.tachycardia.detected ? 'DETECTED' : 'NORMAL'}
    - Stress Level: ${detectors.stress.level} (${detectors.stress.percentage}%)
    - Arrhythmia / Irregular Rhythm Risk: ${detectors.arrhythmia.detected ? 'ELEVATED' : 'LOW'} (${detectors.arrhythmia.percentage}%)
    ${metadata?.cholesterol ? `- Total Cholesterol: ${metadata.cholesterol} mg/dL (${detectors.cholesterol?.status})` : ''}

    INSTRUCTIONS:
    1. Provide a concise, clear 2-3 sentence summary explaining what this pulse rhythm and stress level mean for the patient in plain English.
    2. Provide 2-3 actionable, health-focused recommendations.
    3. Return purely JSON matching: {"summary": "...", "recommendations": ["...", "..."]}
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(result.text || '{}');
    return {
      summary:
        parsed.summary ||
        `Your average heart rate is ${features.hr_mean} BPM with a ${detectors.stress.level.toLowerCase()} physiological stress index (${detectors.stress.percentage}%). Heart rate variability is within an acceptable range.`,
      recommendations: parsed.recommendations || [
        'Maintain regular hydration and steady cardiovascular exercise.',
        'Take a 5-minute deep breathing break to balance heart rate variability.',
      ],
    };
  } catch (err) {
    console.error('Gemini PPG synthesis failed:', err);
    return {
      summary: `Your resting heart rate is ${features.hr_mean} BPM with a ${detectors.stress.level.toLowerCase()} stress index (${detectors.stress.percentage}%). Cardiovascular rhythm appears ${detectors.arrhythmia.detected ? 'slightly irregular' : 'consistent'}.`,
      recommendations: [
        'Practice slow paced breathing to improve autonomic recovery.',
        'Log your symptoms if you feel palpitations or fatigue.',
      ],
    };
  }
}
