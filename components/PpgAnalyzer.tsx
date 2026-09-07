import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Dot,
} from 'recharts';
import { apiClient } from '../services/apiClient';
import { Patient } from '../types';

interface PpgAnalysisResult {
  features: {
    n_peaks: number;
    mean_rr: number;
    sdnn: number;
    rmssd: number;
    hr_mean: number;
    hr_std: number;
    fs: number;
  };
  detectors: {
    bradycardia: { detected: boolean; score: number };
    tachycardia: { detected: boolean; score: number };
    stress: { score: number; percentage: number; level: 'LOW' | 'MODERATE' | 'HIGH' };
    arrhythmia: { detected: boolean; score: number; percentage: number };
    cholesterol?: { value: number; status: 'NORMAL' | 'ELEVATED' };
  };
  aiSummary: string;
  recommendations: string[];
  metadata: {
    age?: number;
    sex?: string;
    cholesterol?: number;
    durationSec: number;
  };
  sampleWaveform: { time: number; value: number; isPeak: boolean }[];
  updatedPatient?: Patient;
}

interface Props {
  onPatientUpdated?: (patient: Patient) => void;
}

export const PpgAnalyzer: React.FC<Props> = ({ onPatientUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PpgAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeFileName, setActiveFileName] = useState<string>('');

  const handleRunSample = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await apiClient.post<PpgAnalysisResult>('/api/vitals/analyze-ppg', {
        useSample: true,
      });
      setAnalysis(data);
      setActiveFileName('sujeto4_PPG_INFO.csv (Pulsera Clinical Dataset)');
      if (data.updatedPatient && onPatientUpdated) {
        onPatientUpdated(data.updatedPatient);
      }
    } catch (err: any) {
      console.error('Failed to analyze sample PPG:', err);
      setErrorMsg(err.message || 'Failed to process sample PPG dataset');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg('');
    setActiveFileName(file.name);

    try {
      const data = await apiClient.upload<PpgAnalysisResult>('/api/vitals/analyze-ppg', file);
      setAnalysis(data);
      if (data.updatedPatient && onPatientUpdated) {
        onPatientUpdated(data.updatedPatient);
      }
    } catch (err: any) {
      console.error('Failed to upload and analyze PPG CSV:', err);
      setErrorMsg(err.message || 'Failed to analyze uploaded CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-50/70 to-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <h3 className="font-bold text-zinc-900 text-base">Wearable PPG Biosignal Analyzer</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              Optical Pulse Wave
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Process raw Photoplethysmography (PPG) pulses from smart bands to detect arrhythmias, HRV, and stress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-zinc-200 shadow-sm transition-all flex items-center gap-1.5">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleRunSample}
            disabled={loading}
            className="bg-zinc-900 hover:bg-black text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Load Test Subject 4</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="m-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Content Area */}
      {!analysis && !loading ? (
        <div className="p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="font-bold text-zinc-900 text-sm">No Wearable Biosignal Loaded</h4>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Click <strong>"Load Test Subject 4"</strong> to analyze real clinical Photoplethysmography (PPG) data from our test dataset, or upload your own smartwatch CSV recording.
            </p>
          </div>
          <button
            onClick={handleRunSample}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-red-200 transition-all"
          >
            Run Clinical Test Dataset
          </button>
        </div>
      ) : null}

      {analysis && (
        <div className="p-6 space-y-6">
          {/* Active File Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900">Source:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-zinc-200 text-zinc-800">
                {activeFileName}
              </span>
            </div>
            <div className="flex items-center gap-4 text-zinc-500 text-[11px]">
              {analysis.metadata.age && <span>Age: <strong>{analysis.metadata.age}</strong></span>}
              {analysis.metadata.sex && <span>Sex: <strong>{analysis.metadata.sex}</strong></span>}
              {analysis.metadata.durationSec && (
                <span>Duration: <strong>{analysis.metadata.durationSec}s</strong></span>
              )}
              <span>Sampling: <strong>{analysis.features.fs} Hz</strong></span>
            </div>
          </div>

          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Heart Rate */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">Resting Pulse</span>
                <span className="text-red-500 font-bold">BPM</span>
              </div>
              <div className="text-2xl font-bold text-zinc-900">
                {Math.round(analysis.features.hr_mean)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                {analysis.detectors.tachycardia.detected ? (
                  <span className="text-red-600 font-semibold">Tachycardia</span>
                ) : analysis.detectors.bradycardia.detected ? (
                  <span className="text-amber-600 font-semibold">Bradycardia</span>
                ) : (
                  <span className="text-green-600 font-semibold">Normal Cadence</span>
                )}
                <span className="text-zinc-400">• σ {analysis.features.hr_std}</span>
              </div>
            </div>

            {/* Stress Index */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">Stress Index</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    analysis.detectors.stress.level === 'HIGH'
                      ? 'bg-red-100 text-red-700'
                      : analysis.detectors.stress.level === 'MODERATE'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {analysis.detectors.stress.level}
                </span>
              </div>
              <div className="text-2xl font-bold text-zinc-900">
                {analysis.detectors.stress.percentage}%
              </div>
              <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    analysis.detectors.stress.level === 'HIGH'
                      ? 'bg-red-500'
                      : analysis.detectors.stress.level === 'MODERATE'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${analysis.detectors.stress.percentage}%` }}
                />
              </div>
            </div>

            {/* Arrhythmia Risk */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">Arrhythmia Risk</span>
                <span className="text-zinc-400 text-[10px] font-bold">Rhythm</span>
              </div>
              <div className="text-2xl font-bold text-zinc-900">
                {analysis.detectors.arrhythmia.percentage}%
              </div>
              <div className="mt-1 text-[11px] font-semibold text-zinc-500">
                {analysis.detectors.arrhythmia.detected ? (
                  <span className="text-red-600">Rhythm Irregularity Detected</span>
                ) : (
                  <span className="text-green-600">Regular Sinus Rhythm</span>
                )}
              </div>
            </div>

            {/* HRV & Cholesterol */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">HRV (SDNN / RMSSD)</span>
                <span className="text-indigo-500 font-bold text-[10px]">ms</span>
              </div>
              <div className="text-lg font-bold text-zinc-900">
                {(analysis.features.sdnn * 1000).toFixed(0)} / {(analysis.features.rmssd * 1000).toFixed(0)}
              </div>
              <div className="mt-1 text-[11px] text-zinc-500">
                {analysis.metadata.cholesterol ? (
                  <span>
                    Cholesterol: <strong>{analysis.metadata.cholesterol} mg/dL</strong>
                  </span>
                ) : (
                  <span>{analysis.features.n_peaks} heartbeats captured</span>
                )}
              </div>
            </div>
          </div>

          {/* Pulse Waveform Visualizer */}
          <div className="bg-zinc-900 p-5 rounded-2xl text-white shadow-inner">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-zinc-100">Live Pulse Waveform (PPG)</span>
                <span className="text-zinc-400 text-[10px]">First 250 samples • 38.5 Hz</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span> Optical Pulse
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Systolic Peak
                </span>
              </div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysis.sampleWaveform} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `${v}s`}
                  />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`${val} V`, 'PPG Signal']}
                    labelFormatter={(label) => `Time: ${label}s`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={(props: any) => {
                      const { payload, cx, cy } = props;
                      if (payload && payload.isPeak) {
                        return <circle key={`peak-${cx}-${cy}`} cx={cx} cy={cy} r={3.5} fill="#ef4444" stroke="#ffffff" strokeWidth={1} />;
                      }
                      return <React.Fragment key={`dot-${cx}-${cy}`} />;
                    }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gemini AI Clinical Synthesis */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-red-50/60 to-orange-50/40 border border-red-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                P
              </div>
              <h4 className="font-bold text-zinc-900 text-sm">Pulse AI — Cardiovascular & Stress Assessment</h4>
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed">{analysis.aiSummary}</p>

            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="pt-2 border-t border-red-100/60">
                <p className="text-[11px] font-bold text-zinc-900 uppercase tracking-wide mb-1.5">
                  Actionable Recommendations:
                </p>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-zinc-600 flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
