
export type Role = 'PATIENT' | 'DOCTOR';

export type RiskLevel = 'NORMAL' | 'WORSENING' | 'CRITICAL';

export interface VitalRecord {
  id: string;
  timestamp: string;
  source: 'MANUAL' | 'HOSPITAL_UPLOAD' | 'WEARABLE';
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  glucose?: number;
  notes?: string;
}

export interface Appointment {
  id: string | number;
  doctor: string;
  specialty: string;
  date: string;
  type: string;
  status: 'Upcoming' | 'Completed';
  location: string;
}

export interface LabResult {
  id: string;
  timestamp: string;
  testName: string;
  value: string;
  unit: string;
  range: string;
  flag: 'NORMAL' | 'HIGH' | 'LOW';
  source: 'HOSPITAL_UPLOAD';
}

export interface RiskAnalysis {
  level: RiskLevel;
  summary: string;
  actionItems: string[];
  alertTriggered: boolean;
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  vitalsHistory: VitalRecord[];
  labHistory: LabResult[];
  currentRisk: RiskAnalysis;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingUrls?: string[];
}

export interface DeviceIntegration {
  id: string;
  name: string;
  provider: 'Apple' | 'Google' | 'Oura' | 'Fitbit' | 'Garmin' | 'Whoop' | 'Dexcom';
  type: 'Wearable' | 'App' | 'Medical Device';
  status: 'Connected' | 'Disconnected' | 'Syncing';
  lastSync?: string;
  batteryLevel?: number;
  iconBg: string;
  iconColor: string;
}
